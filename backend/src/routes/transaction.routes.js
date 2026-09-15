const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transaction.controller');
const authMiddleware = require('../middleware/auth.middleware');

/**
 * ============================================================================
 * TRANSACTION & LEDGER ROUTES
 * All routes require a valid JWT token via Authorization header or cookie.
 * ============================================================================
 */

// 1. Deposit funds into an account
router.post('/deposit', authMiddleware.authMiddleware, transactionController.depositController);

// 2. Transfer money to an account or UPI ID
router.post('/transfer', authMiddleware.authMiddleware, transactionController.transferController);

// 3. Get all transactions for the logged-in user
router.get('/', authMiddleware.authMiddleware, transactionController.getUserTransactionsController);

// 4. Get transactions specifically for one bank account
router.get('/account/:accountId', authMiddleware.authMiddleware, transactionController.getAccountTransactionsController);

module.exports = router;

