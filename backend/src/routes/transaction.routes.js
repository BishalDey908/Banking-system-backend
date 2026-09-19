const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transaction.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { transactionLimiter } = require('../middleware/rateLimit.middleware');

/**
 * ============================================================================
 * TRANSACTION & LEDGER ROUTES
 * All routes require a valid JWT token via Authorization header or cookie.
 * ============================================================================
 */

// 1. Deposit funds into an account
router.post('/deposit', authMiddleware.authMiddleware, transactionLimiter, transactionController.depositController);

// 2. Transfer money to an account or UPI ID
router.post('/transfer', authMiddleware.authMiddleware, transactionLimiter, transactionController.transferController);

// 3. Get all transactions for the logged-in user
router.get('/', authMiddleware.authMiddleware,transactionLimiter, transactionController.getUserTransactionsController);

// 4. Get transactions specifically for one bank account
router.get('/account/:accountId', authMiddleware.authMiddleware,transactionLimiter, transactionController.getAccountTransactionsController);

module.exports = router;

