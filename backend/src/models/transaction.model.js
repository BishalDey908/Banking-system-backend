const mongoose = require('mongoose');

/**
 * ============================================================================
 * BANKING TRANSACTION / LEDGER MODEL
 * ============================================================================
 * In a real banking system, every financial movement is recorded in a ledger.
 * A ledger entry is IMMUTABLE (never edited or deleted).
 * 
 * - CREDIT: Money entering the account (+ balance)
 * - DEBIT:  Money leaving the account (- balance)
 * - balanceAfter: Captures the exact snapshot of account balance at that moment
 * ============================================================================
 */
const transactionSchema = new mongoose.Schema({
    // Account that this transaction belongs to
    account: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'account',
        required: [true, 'Transaction must be linked to an account'],
        index: true
    },

    // User who owns this account
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: [true, 'Transaction must belong to a user'],
        index: true
    },

    // Type: CREDIT (money in) or DEBIT (money out)
    type: {
        type: String,
        enum: ['CREDIT', 'DEBIT'],
        required: [true, 'Transaction type must be CREDIT or DEBIT']
    },

    // Amount of money (always positive, rounded to 2 decimal places)
    amount: {
        type: Number,
        required: [true, 'Transaction amount is required'],
        min: [0.01, 'Amount must be greater than 0'],
        set: (v) => Math.round((Number(v) + Number.EPSILON) * 100) / 100
    },

    // ISO currency code (e.g. INR)
    currency: {
        type: String,
        default: 'INR'
    },

    // Account balance immediately after this transaction took place (snapshot)
    balanceAfter: {
        type: Number,
        required: [true, 'Ledger balance snapshot is required'],
        set: (v) => Math.round((Number(v) + Number.EPSILON) * 100) / 100
    },

    // Human-readable title (e.g. "Transfer to Rahul", "Deposit", "Salary")
    title: {
        type: String,
        required: [true, 'Transaction title is required'],
        trim: true
    },

    // Category for grouping (e.g. 'Transfer', 'Deposit', 'Income', 'Bills')
    category: {
        type: String,
        default: 'General'
    },

    // Status: COMPLETED, PENDING, FAILED
    status: {
        type: String,
        enum: ['COMPLETED', 'PENDING', 'FAILED'],
        default: 'COMPLETED'
    },

    // Unique reference number for banking reconciliation
    reference: {
        type: String,
        required: true,
        unique: true
    },

    // Optional recipient details for wire transfers
    recipientName: {
        type: String,
        trim: true
    },
    recipientAccount: {
        type: String,
        trim: true
    },
    note: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

// Index for fast query of an account's ledger entries by date
transactionSchema.index({ account: 1, createdAt: -1 });
transactionSchema.index({ user: 1, createdAt: -1 });

const transactionModel = mongoose.model('transaction', transactionSchema);

module.exports = transactionModel;

