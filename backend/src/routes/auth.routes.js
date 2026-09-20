const express = require("express")
const authcontroller = require("../controllers/auth.controller")
const authMiddleware = require("../middleware/auth.middleware")
const { authLimiter } = require("../middleware/rateLimit.middleware")

const router = express.Router()

/* Registration with OTP */
/**
 * @route POST /api/auth/register/send-otp
 * @desc Send email verification OTP for registration
 * @access Public
 */
router.post("/register/send-otp", authLimiter, authcontroller.sendRegisterOtpController);

/**
 * @route POST /api/auth/register/verify-otp
 * @desc Verify email OTP and create new account
 * @access Public
 */
router.post("/register/verify-otp", authLimiter, authcontroller.verifyRegisterOtpController);

/**     
 * @route POST /api/auth/register
 * @desc Direct user registration (fallback)
 * @access Public
 */
router.post("/register", authLimiter, authcontroller.userRegisterController);

/* Login Routes */
/**     
 * @route POST /api/auth/login
 * @desc Password login (triggers 2FA challenge if enabled)
 * @access Public
 */
router.post("/login", authLimiter, authcontroller.userLoginController);

/**
 * @route POST /api/auth/login/verify-2fa
 * @desc Verify 2FA OTP and unlock session
 * @access Public
 */
router.post("/login/verify-2fa", authLimiter, authcontroller.verify2faController);

/**
 * @route POST /api/auth/login/send-otp
 * @desc Send one-time login passcode to email
 * @access Public
 */
router.post("/login/send-otp", authLimiter, authcontroller.sendLoginOtpController);

/**
 * @route POST /api/auth/login/verify-otp
 * @desc Verify login OTP and sign in
 * @access Public
 */
router.post("/login/verify-otp", authLimiter, authcontroller.verifyLoginOtpController);

/* 2FA Settings */
/**
 * @route POST /api/auth/2fa/toggle
 * @desc Enable or disable Two-Factor Authentication
 * @access Private
 */
router.post("/2fa/toggle", authMiddleware.authMiddleware, authcontroller.toggle2faController);

/* Password Reset Routes */
/**
 * @route POST /api/auth/forgot-password
 * @desc Send password reset OTP to email
 * @access Public
 */
router.post("/forgot-password", authLimiter, authcontroller.forgotPasswordController);

/**
 * @route POST /api/auth/reset-password
 * @desc Verify reset OTP and update password
 * @access Public
 */
router.post("/reset-password", authLimiter, authcontroller.resetPasswordController);

/* Google Sign-In Route */
/**     
 * @route POST /api/auth/google
 * @desc Sign in or register directly with Google
 * @access Public
 */
router.post("/google", authLimiter, authcontroller.googleAuthController);

/* Current User Profile Route */
/**     
 * @route GET /api/auth/me
 * @desc Get authenticated user profile
 * @access Private
 */
router.get("/me", authMiddleware.authMiddleware, authcontroller.userMeController);

/* Logout Route */
/**     
 * @route POST /api/auth/logout
 * @desc Logout user and clear cookie
 * @access Public
 */
router.post("/logout", authcontroller.userLogoutController);

module.exports = router