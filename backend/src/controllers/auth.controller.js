const userModel = require("../models/user.model");
const otpModel = require("../models/otp.model");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const accountModel = require("../models/account.model");
const transactionModel = require("../models/transaction.model");
const emailService = require("../services/email.service");
const cacheService = require("../services/cache.service");

/**
 * 1. Registration - Send OTP
 */
async function sendRegisterOtpController(req, res) {
    try {
        const { email, name, password } = req.body;

        if (!email || !name || !password) {
            return res.status(400).json({
                message: "Name, email, and password are required"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters long"
            });
        }

        const isExists = await userModel.findOne({ email: email.toLowerCase().trim() });
        if (isExists) {
            return res.status(422).json({
                message: "An account with this email address already exists.",
                status: "failed"
            });
        }

        const otp = await otpModel.generateOtp({
            email: email.toLowerCase().trim(),
            purpose: "REGISTER",
            ttlMinutes: 10
        });

        console.log(`\n======================================================`);
        console.log(`🔑 [DEV OTP] Purpose: REGISTER | Email: ${email} | OTP: ${otp}`);
        console.log(`======================================================\n`);

        // Send OTP via email (asynchronous to avoid network delays)
        emailService.sendOtpEmail({
            to: email.toLowerCase().trim(),
            name,
            otp,
            purpose: "REGISTER"
        }).catch(err => console.error("[Auth] Registration OTP email failed:", err.message));

        return res.status(200).json({
            message: "Verification code sent to your email.",
            email: email.toLowerCase().trim()
        });
    } catch (err) {
        console.error("sendRegisterOtpController error:", err);
        return res.status(500).json({
            message: err.message || "Failed to send verification code. Please try again."
        });
    }
}

/**
 * 2. Registration - Verify OTP & Create User
 */
async function verifyRegisterOtpController(req, res) {
    try {
        const { email, name, password, otp } = req.body;

        if (!email || !name || !password || !otp) {
            return res.status(400).json({
                message: "All fields (name, email, password, and OTP) are required"
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        const otpResult = await otpModel.verifyAndConsumeOtp({
            email: normalizedEmail,
            purpose: "REGISTER",
            candidateOtp: otp
        });

        if (!otpResult.valid) {
            return res.status(400).json({
                message: otpResult.message
            });
        }

        // Concurrency safeguard: ensure user hasn't been created in the interim
        const isExists = await userModel.findOne({ email: normalizedEmail });
        if (isExists) {
            return res.status(422).json({
                message: "User already registered"
            });
        }

        const user = await userModel.create({
            email: normalizedEmail,
            password,
            name
        });

        const token = jwt.sign(
            { userID: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "3d" }
        );

        res.cookie("token", token);

        // Send welcome email asynchronously
        emailService.sendRegistrationEmail(user.email, user.name).catch(err => {
            console.error("Failed to send welcome email:", err.message);
        });

        return res.status(201).json({
            user: {
                _id: user._id,
                email: user.email,
                name: user.name,
                isTwoFactorEnabled: Boolean(user.isTwoFactorEnabled)
            },
            token
        });
    } catch (err) {
        console.error("verifyRegisterOtpController error:", err);
        return res.status(500).json({
            message: err.message || "An error occurred during account creation."
        });
    }
}

/**
 * 3. Direct User Registration (Fallback / Legacy)
 */
async function userRegisterController(req, res) {
    try {
        const { email, password, name } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({
                message: "Name, email, and password are required"
            });
        }

        const isExists = await userModel.findOne({ email: email.toLowerCase().trim() });
        if (isExists) {
            return res.status(422).json({
                message: "User already registered",
                status: "failed"
            });
        }

        const user = await userModel.create({ email: email.toLowerCase().trim(), password, name });

        const token = jwt.sign(
            { userID: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "3d" }
        );

        res.cookie("token", token);

        res.status(201).json({
            user: {
                _id: user._id,
                email: user.email,
                name: user.name,
                isTwoFactorEnabled: Boolean(user.isTwoFactorEnabled)
            },
            token
        });

        emailService.sendRegistrationEmail(user.email, user.name).catch(emailErr => {
            console.error("Failed to send welcome email:", emailErr.message);
        });
    } catch (err) {
        console.error("Registration error:", err);
        return res.status(500).json({
            message: err.message || "An error occurred during registration."
        });
    }
}

/**
 * 4. Password Login (with 2FA Check)
 */
async function userLoginController(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const user = await userModel.findOne({ email: email.toLowerCase().trim() }).select("+password");

        if (!user) {
            return res.status(401).json({
                message: "Email or password is invalid"
            });
        }

        const isPasswordCorrect = await user.comparePassword(password);

        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: "Email or password is invalid"
            });
        }

        // 2FA CHECK: If Two-Factor Authentication is enabled, issue challenge
        if (user.isTwoFactorEnabled) {
            const otp = await otpModel.generateOtp({
                email: user.email,
                purpose: "2FA",
                ttlMinutes: 10
            });

            console.log(`\n======================================================`);
            console.log(`🔑 [DEV OTP] Purpose: 2FA | Email: ${user.email} | OTP: ${otp}`);
            console.log(`======================================================\n`);

            // Sign temporary 2FA token valid for 10 minutes
            const tempToken = jwt.sign(
                { userID: user._id, is2FA: true },
                process.env.JWT_SECRET,
                { expiresIn: "10m" }
            );

            // Send 2FA OTP via email
            emailService.sendOtpEmail({
                to: user.email,
                name: user.name,
                otp,
                purpose: "2FA"
            }).catch(err => console.error("[Auth] 2FA OTP email failed:", err.message));

            return res.status(200).json({
                twoFactorRequired: true,
                tempToken,
                email: user.email,
                message: "Two-Factor Authentication code sent to your email."
            });
        }

        // Regular login if 2FA is not enabled
        const token = jwt.sign(
            { userID: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "3d" }
        );

        res.cookie("token", token);

        return res.status(200).json({
            user: {
                _id: user._id,
                email: user.email,
                name: user.name,
                isTwoFactorEnabled: Boolean(user.isTwoFactorEnabled)
            },
            token
        });
    } catch (err) {
        console.error("Login controller error:", err);
        return res.status(500).json({
            message: err.message || "An unexpected error occurred during login. Please try again."
        });
    }
}

/**
 * 5. Verify 2FA OTP
 */
async function verify2faController(req, res) {
    try {
        const { tempToken, otp } = req.body;

        if (!tempToken || !otp) {
            return res.status(400).json({
                message: "Temporary token and 6-digit OTP code are required"
            });
        }

        let decoded;
        try {
            decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
        } catch (jwtErr) {
            return res.status(401).json({
                message: "2FA verification session expired. Please sign in again."
            });
        }

        if (!decoded.is2FA || !decoded.userID) {
            return res.status(401).json({
                message: "Invalid 2FA session."
            });
        }

        const user = await userModel.findById(decoded.userID);
        if (!user) {
            return res.status(404).json({
                message: "User account not found"
            });
        }

        const otpResult = await otpModel.verifyAndConsumeOtp({
            email: user.email,
            purpose: "2FA",
            candidateOtp: otp
        });

        if (!otpResult.valid) {
            return res.status(400).json({
                message: otpResult.message
            });
        }

        // Issue full session token
        const token = jwt.sign(
            { userID: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "3d" }
        );

        res.cookie("token", token);

        return res.status(200).json({
            user: {
                _id: user._id,
                email: user.email,
                name: user.name,
                isTwoFactorEnabled: Boolean(user.isTwoFactorEnabled)
            },
            token
        });
    } catch (err) {
        console.error("verify2faController error:", err);
        return res.status(500).json({
            message: err.message || "Failed to verify 2FA code."
        });
    }
}

/**
 * 6. Send Passwordless Login OTP
 */
async function sendLoginOtpController(req, res) {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                message: "Email is required"
            });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const user = await userModel.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(404).json({
                message: "No registered account found with this email address."
            });
        }

        const otp = await otpModel.generateOtp({
            email: normalizedEmail,
            purpose: "LOGIN",
            ttlMinutes: 10
        });

        console.log(`\n======================================================`);
        console.log(`🔑 [DEV OTP] Purpose: LOGIN | Email: ${normalizedEmail} | OTP: ${otp}`);
        console.log(`======================================================\n`);

        emailService.sendOtpEmail({
            to: user.email,
            name: user.name,
            otp,
            purpose: "LOGIN"
        }).catch(err => console.error("[Auth] Login OTP email failed:", err.message));

        return res.status(200).json({
            message: "One-time login passcode sent to your email.",
            email: normalizedEmail
        });
    } catch (err) {
        console.error("sendLoginOtpController error:", err);
        return res.status(500).json({
            message: err.message || "Failed to send login code."
        });
    }
}

/**
 * 7. Verify Passwordless Login OTP
 */
async function verifyLoginOtpController(req, res) {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                message: "Email and OTP code are required"
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        const otpResult = await otpModel.verifyAndConsumeOtp({
            email: normalizedEmail,
            purpose: "LOGIN",
            candidateOtp: otp
        });

        if (!otpResult.valid) {
            return res.status(400).json({
                message: otpResult.message
            });
        }

        const user = await userModel.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(404).json({
                message: "User account not found"
            });
        }

        const token = jwt.sign(
            { userID: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "3d" }
        );

        res.cookie("token", token);

        return res.status(200).json({
            user: {
                _id: user._id,
                email: user.email,
                name: user.name,
                isTwoFactorEnabled: Boolean(user.isTwoFactorEnabled)
            },
            token
        });
    } catch (err) {
        console.error("verifyLoginOtpController error:", err);
        return res.status(500).json({
            message: err.message || "Failed to sign in with OTP."
        });
    }
}

/**
 * 8. Toggle Two-Factor Authentication (Settings)
 */
async function toggle2faController(req, res) {
    try {
        const userId = req.user._id;
        const { enable } = req.body;

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.isTwoFactorEnabled = typeof enable === "boolean" ? enable : !user.isTwoFactorEnabled;
        await user.save();

        // Clear cached profile in Redis
        await cacheService.del(`cache:user:${userId}:profile`);

        return res.status(200).json({
            message: `Two-factor authentication ${user.isTwoFactorEnabled ? "enabled" : "disabled"} successfully.`,
            isTwoFactorEnabled: user.isTwoFactorEnabled
        });
    } catch (err) {
        console.error("toggle2faController error:", err);
        return res.status(500).json({
            message: err.message || "Failed to update 2FA settings."
        });
    }
}

/**
 * 9. Forgot Password - Request Reset Code
 */
async function forgotPasswordController(req, res) {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const user = await userModel.findOne({ email: normalizedEmail });

        if (!user) {
            // Return 200 to prevent user enumeration
            return res.status(200).json({
                message: "If an account exists with this email, a password reset code has been sent.",
                email: normalizedEmail
            });
        }

        const otp = await otpModel.generateOtp({
            email: normalizedEmail,
            purpose: "RESET_PASSWORD",
            ttlMinutes: 10
        });

        console.log(`\n======================================================`);
        console.log(`🔑 [DEV OTP] Purpose: RESET_PASSWORD | Email: ${normalizedEmail} | OTP: ${otp}`);
        console.log(`======================================================\n`);

        emailService.sendOtpEmail({
            to: user.email,
            name: user.name,
            otp,
            purpose: "RESET_PASSWORD"
        }).catch(err => console.error("[Auth] Reset password OTP email failed:", err.message));

        return res.status(200).json({
            message: "Password reset code sent to your email.",
            email: normalizedEmail
        });
    } catch (err) {
        console.error("forgotPasswordController error:", err);
        return res.status(500).json({
            message: err.message || "Failed to initiate password reset."
        });
    }
}

/**
 * 10. Reset Password - Verify OTP & Set New Password
 */
async function resetPasswordController(req, res) {
    try {
        const { email, otp, newPassword } = req.body;

        if (!email || !otp || !newPassword) {
            return res.status(400).json({
                message: "Email, OTP code, and new password are required"
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                message: "New password must be at least 6 characters long"
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        const otpResult = await otpModel.verifyAndConsumeOtp({
            email: normalizedEmail,
            purpose: "RESET_PASSWORD",
            candidateOtp: otp
        });

        if (!otpResult.valid) {
            return res.status(400).json({
                message: otpResult.message
            });
        }

        const user = await userModel.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Setting user.password triggers the pre("save") bcrypt hook
        user.password = newPassword;
        await user.save();

        return res.status(200).json({
            message: "Password has been reset successfully. You can now log in with your new password."
        });
    } catch (err) {
        console.error("resetPasswordController error:", err);
        return res.status(500).json({
            message: err.message || "Failed to reset password."
        });
    }
}

async function userMeController(req, res) {
    const userId = req.user._id;
    const cacheKey = `cache:user:${userId}:profile`;

    // 1. Cache-Aside: Check Redis cache first
    const cachedProfile = await cacheService.get(cacheKey);
    if (cachedProfile) {
        return res.status(200).json(cachedProfile);
    }

    const payload = {
        user: {
            _id: req.user._id,
            email: req.user.email,
            name: req.user.name,
            isTwoFactorEnabled: Boolean(req.user.isTwoFactorEnabled)
        }
    };

    // 2. Populate cache with 10-minute TTL (600 seconds)
    await cacheService.set(cacheKey, payload, 600);

    res.status(200).json(payload);
}

async function userLogoutController(req, res) {
    if (req.user?._id) {
        await cacheService.del(`cache:user:${req.user._id}:profile`);
    }
    res.clearCookie("token");
    res.status(200).json({
        message: "Logged out successfully"
    });
}

/**
 * Direct Google Sign-In & Authentication Controller
 * Verifies Google ID tokens or processes authenticated Google credentials,
 * auto-provisions user profile and ₹10,000 opening reserve if new.
 */
async function googleAuthController(req, res) {
    try {
        const { credential, accessToken, email: directEmail, name: directName } = req.body;

        let email = directEmail;
        let name = directName;

        // 1. If Google Access Token was supplied (OAuth2 popup flow), fetch Google UserInfo
        if (accessToken) {
            try {
                const userinfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                    headers: { Authorization: `Bearer ${accessToken}` }
                });
                if (userinfoRes.ok) {
                    const payload = await userinfoRes.json();
                    if (payload.email) {
                        email = payload.email;
                        name = payload.name || name;
                    }
                } else {
                    console.warn("Google userinfo returned non-200 for access token");
                }
            } catch (fetchErr) {
                console.warn("Network error during Google userinfo fetch:", fetchErr.message);
            }
        }

        // 2. If Google ID Token credential was supplied, verify it via Google TokenInfo API
        if (credential) {
            try {
                const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`);
                if (googleRes.ok) {
                    const payload = await googleRes.json();
                    if (payload.email) {
                        email = payload.email;
                        name = payload.name || name;
                    }
                } else {
                    console.warn("Google tokeninfo returned non-200, checking direct email fallback");
                }
            } catch (fetchErr) {
                console.warn("Network error during Google token verification:", fetchErr.message);
            }
        }

        if (!email) {
            return res.status(400).json({
                message: "Valid email is required for Google authentication",
                status: "failed"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Check if user already exists
        let user = await userModel.findOne({ email: normalizedEmail });
        let isNewUser = false;

        if (!user) {
            isNewUser = true;
            const randomPass = crypto.randomBytes(16).toString("hex") + "A1!";
            user = await userModel.create({
                email: normalizedEmail,
                name: name || "Google Member",
                password: randomPass
            });

            // Auto-provision initial primary bank account with ₹10,000 opening balance
            try {
                const newAccount = await accountModel.create({
                    user: user._id,
                    currency: "INR",
                    balance: 10000
                });

                await transactionModel.create({
                    account: newAccount._id,
                    user: user._id,
                    type: "CREDIT",
                    amount: 10000,
                    currency: "INR",
                    balanceAfter: 10000,
                    title: "Welcome Credit / Opening Balance",
                    category: "Deposit",
                    status: "COMPLETED",
                    reference: `OPN-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
                    note: "Initial account opening welcome credit for Google sign-in"
                });
            } catch (accErr) {
                console.warn("Failed to create initial account for Google user:", accErr.message);
            }

            // Send registration email
            try {
                await emailService.sendRegistrationEmail(user.email, user.name);
            } catch (mailErr) {
                console.warn("Google registration email failed:", mailErr.message);
            }
        } else {
            // Ensure existing user has at least 1 bank account
            const existingAccount = await accountModel.findOne({ user: user._id });
            if (!existingAccount) {
                const newAccount = await accountModel.create({
                    user: user._id,
                    currency: "INR",
                    balance: 10000
                });
                await transactionModel.create({
                    account: newAccount._id,
                    user: user._id,
                    type: "CREDIT",
                    amount: 10000,
                    currency: "INR",
                    balanceAfter: 10000,
                    title: "Welcome Credit / Opening Balance",
                    category: "Deposit",
                    status: "COMPLETED",
                    reference: `OPN-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
                    note: "Initial account opening welcome credit"
                });
            }
        }

        const token = jwt.sign({
            userID: user._id
        }, process.env.JWT_SECRET, {
            expiresIn: "3d"
        });

        res.cookie("token", token);

        res.status(200).json({
            user: {
                _id: user._id,
                email: user.email,
                name: user.name
            },
            token,
            isNewUser
        });
    } catch (err) {
        console.error("Google authentication error:", err);
        res.status(500).json({
            message: "Google authentication failed",
            error: err.message || err
        });
    }
}

module.exports = {
    sendRegisterOtpController,
    verifyRegisterOtpController,
    userRegisterController,
    userLoginController,
    verify2faController,
    sendLoginOtpController,
    verifyLoginOtpController,
    toggle2faController,
    forgotPasswordController,
    resetPasswordController,
    userMeController,
    userLogoutController,
    googleAuthController,
};