const express = require('express');
const router = express.Router();
const accountController = require('../controllers/account.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { accountCreationLimiter } = require('../middleware/rateLimit.middleware');

router.get('/', authMiddleware.authMiddleware, accountController.getUserAccountsController);
router.post('/create', authMiddleware.authMiddleware, accountCreationLimiter, accountController.createAccountController);

module.exports = router;