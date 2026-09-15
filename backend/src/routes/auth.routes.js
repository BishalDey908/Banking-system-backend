const express = require("express")
const authcontroller = require("../controllers/auth.controller")

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

module.exports = router