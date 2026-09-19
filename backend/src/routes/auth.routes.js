const express = require("express")
const authcontroller = require("../controllers/auth.controller")
const authMiddleware = require("../middleware/auth.middleware")
const { authLimiter } = require("../middleware/rateLimit.middleware")

const router = express.Router()

/*Register Route*/

/**     
 * * - @route POST /api/auth/register
 * * - @desc Register a new user
 * * - @access Public
*/
router.post("/register", authLimiter, authcontroller.userRegisterController)

/*Login Route*/
/**     
 * * - @route POST /api/auth/login
 * * - @desc Login a user
 * * - @access Public
*/
router.post("/login", authLimiter, authcontroller.userLoginController)

/* Google Sign-In Route */
/**     
 * * - @route POST /api/auth/google
 * * - @desc Sign in or register directly with Google
 * * - @access Public
*/
router.post("/google", authLimiter, authcontroller.googleAuthController)

/*Current User Profile Route*/
/**     
 * * - @route GET /api/auth/me
 * * - @desc Get authenticated user profile
 * * - @access Private
*/
router.get("/me", authMiddleware.authMiddleware, authcontroller.userMeController)

/*Logout Route*/
/**     
 * * - @route POST /api/auth/logout
 * * - @desc Logout user and clear cookie
 * * - @access Public
*/
router.post("/logout", authcontroller.userLogoutController)

module.exports = router