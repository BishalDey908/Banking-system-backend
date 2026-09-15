const express = require("express")
const authcontroller = require("../controllers/auth.controller")
const authMiddleware = require("../middleware/auth.middleware")

const router = express.Router()

/*Register Route*/

/**     
 * * - @route POST /api/auth/register
 * * - @desc Register a new user
 * * - @access Public
*/
router.post("/register",authcontroller.userRegisterController)

/*Login Route*/
/**     
 * * - @route POST /api/auth/login
 * * - @desc Login a user
 * * - @access Public
*/
router.post("/login",authcontroller.userLoginController)

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