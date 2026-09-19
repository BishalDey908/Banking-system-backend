const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const accountModel = require("../models/account.model");
const transactionModel = require("../models/transaction.model");
const emailService = require("../services/email.service");
const cacheService = require("../services/cache.service");

async function userRegisterController(req, res) {
    try {
        const { email, password, name } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({
                message: "Name, email, and password are required"
            });
        }

        const isExists = await userModel.findOne({ email });

        if (isExists) {
            return res.status(422).json({
                message: "User already registered",
                status: "failed"
            });
        }

        const user = await userModel.create({ email, password, name });

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
                name: user.name
            },
            token
        });

        // Send registration email asynchronously without blocking response
        try {
            await emailService.sendRegistrationEmail(user.email, user.name);
        } catch (emailErr) {
            console.error("Failed to send welcome email:", emailErr.message);
        }
    } catch (err) {
        console.error("Registration error:", err);
        return res.status(500).json({
            message: err.message || "An error occurred during registration."
        });
    }
}

async function userLoginController(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const user = await userModel.findOne({ email }).select("+password");

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
                name: user.name
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
            name: req.user.name
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
    userRegisterController,
    userLoginController,
    userMeController,
    userLogoutController,
    googleAuthController,
};