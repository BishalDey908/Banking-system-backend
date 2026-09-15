const express = require('express');
const router = express.Router();
const accountController = require('../controllers/account.controller');
const authMiddleware = require('../middleware/auth.middleware');


router.post('/create', authMiddleware.authMiddleware, accountController.createAccountController);

module.exports = router;