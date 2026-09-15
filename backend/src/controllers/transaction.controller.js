const mongoose = require('mongoose');
const accountModel = require('../models/account.model');
const transactionModel = require('../models/transaction.model');

/**
 * ============================================================================
 * BANKING TRANSACTION CONTROLLER
 * ============================================================================
 * Implements fundamental banking concepts:
 * 1. Double-Entry Accounting / Ledger Book:
 *    Every transfer deducts money from sender (DEBIT) and adds to receiver (CREDIT).
 * 2. Balance Consistency & Atomic Safety:
 *    An account's balance can never drop below zero.
 * 3. Automatic Refund on Error:
 *    If an error occurs during transfer, any debited money is immediately
 *    refunded to the sender, an audit refund ledger entry is logged,
 *    and the rest of the process is halted.
 * 4. Audit Trail:
 *    Each transaction stores a running 'balanceAfter' snapshot.
 * ============================================================================
 */

/**
 * Safe banking round function to prevent floating-point inaccuracies (e.g. 0.1 + 0.2 = 0.30000000000000004)
 * Rounds to 2 decimal places (standard currency cents/paise).
 */
function roundMoney(num) {
    const val = Number(num);
    if (isNaN(val)) return 0;
    return Math.round((val + Number.EPSILON) * 100) / 100;
}

/**
 * Deposit funds into an account
 * @route POST /api/transactions/deposit
 */
async function depositController(req, res) {
    let depositCredited = false;
    let account = null;
    let numAmount = 0;

    try {
        const userId = req.user._id;
        const { accountId, amount, note } = req.body;

        numAmount = roundMoney(amount);
        if (numAmount <= 0) {
            return res.status(400).json({ message: "Deposit amount must be greater than 0." });
        }

        // Validate max 2 decimal places in input string
        const strAmount = String(amount).trim();
        if (strAmount.includes('.')) {
            const decimals = strAmount.split('.')[1];
            if (decimals && decimals.length > 2) {
                return res.status(400).json({ message: "Deposit amount cannot have more than 2 decimal places." });
            }
        }

        // 1. Find the target account and ensure the authenticated user owns it
        account = await accountModel.findOne({ _id: accountId, user: userId });
        if (!account) {
            return res.status(404).json({ message: "Bank account not found or access denied." });
        }

        if (account.status !== 'ACTIVE') {
            return res.status(400).json({ message: `Cannot deposit into an account with status: ${account.status}` });
        }

        // 2. Update account balance with strict 2-decimal precision
        const currentBalance = roundMoney(account.balance || 0);
        account.balance = roundMoney(currentBalance + numAmount);
        await account.save();
        depositCredited = true;

        // Support test simulation of error after balance update
        if (req.body?.simulateError || (note && String(note).includes('SIMULATE_ERROR'))) {
            throw new Error("Simulated deposit network failure");
        }

        // 3. Create an immutable CREDIT ledger entry
        const reference = `DEP-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
        const transaction = await transactionModel.create({
            account: account._id,
            user: userId,
            type: 'CREDIT',
            amount: numAmount,
            currency: account.currency || 'INR',
            balanceAfter: account.balance,
            title: 'Funds Deposit',
            category: 'Deposit',
            status: 'COMPLETED',
            reference: reference,
            note: note ? String(note).trim() : 'Cash / Wire deposit to account'
        });

        res.status(201).json({
            message: "Deposit successful",
            newBalance: account.balance,
            transaction
        });
    } catch (err) {
        console.error("Deposit error:", err);

        // Roll back balance if it was credited but subsequent operations failed
        if (depositCredited && account) {
            try {
                account.balance = roundMoney(account.balance - numAmount);
                await account.save();
            } catch (rollbackErr) {
                console.error("Critical: Deposit rollback failed:", rollbackErr);
            }
        }

        res.status(500).json({
            message: "Error processing deposit: " + err.message,
            error: err.message,
            refunded: depositCredited
        });
    }
}

/**
 * Transfer funds from sender's account to a recipient
 * With automatic refund on failure & audit trail
 * @route POST /api/transactions/transfer
 */
async function transferController(req, res) {
    let senderAccount = null;
    let internalReceiver = null;
    let senderDeducted = false;
    let receiverCredited = false;
    let numAmount = 0;
    let trimmedRecipient = '';
    const userId = req.user._id;

    try {
        const { fromAccountId, recipientName, recipientAccount, amount, note } = req.body;

        numAmount = roundMoney(amount);
        if (numAmount <= 0) {
            return res.status(400).json({ message: "Transfer amount must be greater than 0." });
        }

        // Validate max 2 decimal places
        const strAmount = String(amount).trim();
        if (strAmount.includes('.')) {
            const decimals = strAmount.split('.')[1];
            if (decimals && decimals.length > 2) {
                return res.status(400).json({ message: "Transfer amount cannot have more than 2 decimal places." });
            }
        }

        if (!recipientName || !recipientName.trim()) {
            return res.status(400).json({ message: "Recipient name is required." });
        }

        if (!recipientAccount || !recipientAccount.trim()) {
            return res.status(400).json({ message: "Recipient account or UPI ID is required." });
        }

        trimmedRecipient = recipientAccount.trim();

        // Prevent self-transfer to the exact same account
        if (fromAccountId && trimmedRecipient === fromAccountId.toString()) {
            return res.status(400).json({ message: "Cannot transfer money to the same bank account." });
        }

        // 1. Verify sender's account exists and is owned by this user
        senderAccount = await accountModel.findOne({ _id: fromAccountId, user: userId });
        if (!senderAccount) {
            return res.status(404).json({ message: "Sender bank account not found or access denied." });
        }

        if (senderAccount.status !== 'ACTIVE') {
            return res.status(400).json({ message: `Your account is currently ${senderAccount.status}. Transfers disabled.` });
        }

        // 2. Strict Insufficient Funds Check with rounded balance
        const currentBalance = roundMoney(senderAccount.balance || 0);
        if (currentBalance < numAmount) {
            return res.status(400).json({
                message: `Insufficient funds. Available balance is ${senderAccount.currency || 'INR'} ${currentBalance.toFixed(2)}.`
            });
        }

        // 3. Pre-validate internal recipient if it matches a valid ObjectId
        if (mongoose.Types.ObjectId.isValid(trimmedRecipient)) {
            internalReceiver = await accountModel.findById(trimmedRecipient);
            if (internalReceiver) {
                if (internalReceiver.status !== 'ACTIVE') {
                    return res.status(400).json({
                        message: `Cannot transfer: Recipient bank account is currently ${internalReceiver.status}.`
                    });
                }
                if (internalReceiver._id.toString() === senderAccount._id.toString()) {
                    return res.status(400).json({
                        message: "Cannot transfer money to the same bank account."
                    });
                }
            }
        }

        // 4. Deduct amount from sender with exact precision
        senderAccount.balance = roundMoney(currentBalance - numAmount);
        await senderAccount.save();
        senderDeducted = true;

        // Support test simulation of failure after debit to demonstrate automatic refund
        if (req.body?.simulateError || (note && String(note).includes('SIMULATE_ERROR'))) {
            throw new Error("Downstream payment gateway failed after debit");
        }

        // 5. Generate unique transaction reference code
        const reference = `TRF-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

        // 6. Write DEBIT ledger entry for sender
        const senderLedgerEntry = await transactionModel.create({
            account: senderAccount._id,
            user: userId,
            type: 'DEBIT',
            amount: numAmount,
            currency: senderAccount.currency || 'INR',
            balanceAfter: senderAccount.balance,
            title: `Transfer to ${recipientName.trim()}`,
            category: 'Transfer',
            status: 'COMPLETED',
            reference: reference,
            recipientName: recipientName.trim(),
            recipientAccount: trimmedRecipient,
            note: note ? String(note).trim() : ''
        });

        // 7. Double-Entry: If recipient is an internal bank account, credit it!
        if (internalReceiver) {
            const receiverBalance = roundMoney(internalReceiver.balance || 0);
            internalReceiver.balance = roundMoney(receiverBalance + numAmount);
            await internalReceiver.save();
            receiverCredited = true;

            // Create complementary CREDIT entry for receiver
            await transactionModel.create({
                account: internalReceiver._id,
                user: internalReceiver.user,
                type: 'CREDIT',
                amount: numAmount,
                currency: internalReceiver.currency || 'INR',
                balanceAfter: internalReceiver.balance,
                title: `Received from ${req.user.name || 'Aura Member'}`,
                category: 'Transfer',
                status: 'COMPLETED',
                reference: `${reference}-IN`,
                recipientName: req.user.name,
                recipientAccount: senderAccount._id.toString(),
                note: note ? String(note).trim() : ''
            });
        }

        res.status(200).json({
            message: "Transfer completed successfully",
            newBalance: senderAccount.balance,
            transaction: senderLedgerEntry
        });

    } catch (err) {
        console.error("Transfer processing error encountered:", err.message);

        // AUTOMATIC REFUND & STOP REST OF PROCESS
        if (senderDeducted && senderAccount) {
            try {
                // Step A: Roll back receiver balance if it was already credited
                if (receiverCredited && internalReceiver) {
                    internalReceiver.balance = roundMoney(internalReceiver.balance - numAmount);
                    await internalReceiver.save();
                }

                // Step B: Refund the debited amount back to sender's balance
                senderAccount.balance = roundMoney(senderAccount.balance + numAmount);
                await senderAccount.save();

                // Step C: Record an audit CREDIT refund entry in the ledger
                const refundReference = `REF-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
                const refundTransaction = await transactionModel.create({
                    account: senderAccount._id,
                    user: userId,
                    type: 'CREDIT',
                    amount: numAmount,
                    currency: senderAccount.currency || 'INR',
                    balanceAfter: senderAccount.balance,
                    title: `Refund: Transfer Failed`,
                    category: 'Refund',
                    status: 'COMPLETED',
                    reference: refundReference,
                    recipientName: req.body?.recipientName ? String(req.body.recipientName).trim() : 'Recipient',
                    recipientAccount: trimmedRecipient,
                    note: `Automatic refund: Transfer failed and remaining process was stopped (${err.message})`
                });

                // Step D: Stop the rest of the process and notify the client
                return res.status(500).json({
                    message: `Transfer failed: ${err.message}. The deducted amount (${senderAccount.currency || 'INR'} ${numAmount.toFixed(2)}) has been refunded to your account.`,
                    error: err.message,
                    refunded: true,
                    refundAmount: numAmount,
                    newBalance: senderAccount.balance,
                    transaction: refundTransaction
                });

            } catch (refundErr) {
                console.error("CRITICAL: Automatic refund encountered an error:", refundErr);
                return res.status(500).json({
                    message: "Transfer failed and automatic refund encountered an error. Please contact support immediately.",
                    error: refundErr.message,
                    refunded: false
                });
            }
        }

        // If sender was never debited, stop and return the error
        res.status(500).json({
            message: "Error processing transfer: " + err.message,
            error: err.message,
            refunded: false
        });
    }
}

/**
 * Get all ledger transactions for a specific account
 * @route GET /api/transactions/account/:accountId
 */
async function getAccountTransactionsController(req, res) {
    try {
        const userId = req.user._id;
        const { accountId } = req.params;

        // Verify user owns the account
        const account = await accountModel.findOne({ _id: accountId, user: userId });
        if (!account) {
            return res.status(404).json({ message: "Account not found or access denied." });
        }

        const transactions = await transactionModel
            .find({ account: accountId })
            .sort({ createdAt: -1 });

        res.status(200).json(transactions);
    } catch (err) {
        console.error("Fetch account transactions error:", err);
        res.status(500).json({ message: "Error fetching transactions", error: err.message });
    }
}

/**
 * Get all transactions across all accounts for the authenticated user
 * @route GET /api/transactions
 */
async function getUserTransactionsController(req, res) {
    try {
        const userId = req.user._id;

        const transactions = await transactionModel
            .find({ user: userId })
            .sort({ createdAt: -1 });

        res.status(200).json(transactions);
    } catch (err) {
        console.error("Fetch user transactions error:", err);
        res.status(500).json({ message: "Error fetching user transactions", error: err.message });
    }
}

module.exports = {
    depositController,
    transferController,
    getAccountTransactionsController,
    getUserTransactionsController
};

