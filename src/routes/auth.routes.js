const express = require("express")
const authcontroller = require("../controllers/auth.controller")

const router = express.Router()

/*Register Route*/
router.post("/register",authcontroller.userRegisterController)

/*Login Route*/
router.post("/login",authcontroller.userLoginController)

module.exports = router