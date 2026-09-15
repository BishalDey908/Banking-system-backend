const accountModel = require('../models/account.model');
const transactionModel = require('../models/transaction.model');

async function createAccountController(req, res) {
    try {
        const userId = req.user._id || req.user;
        const currency = req.body?.currency || 'INR';

        const account = await accountModel.create({
            user: userId,
            currency: currency,
            balance: 10000
        });

        // Record opening balance in the transaction ledger for mathematical consistency
        try {
            await transactionModel.create({
                account: account._id,
                user: userId,
                type: 'CREDIT',
                amount: 10000,
                currency: account.currency || 'INR',
                balanceAfter: 10000,
                title: 'Welcome Credit / Opening Balance',
                category: 'Deposit',
                status: 'COMPLETED',
                reference: `OPN-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
                note: 'Initial account opening welcome credit'
            });
        } catch (txErr) {
            console.warn("Failed to create opening ledger entry:", txErr.message);
        }

        res.status(201).json(account);
    }
    catch (err) {
        res.status(500).json({ message: "Error creating account.", error: err.message || err });
    }
}

async function getUserAccountsController(req, res) {
    try {
        const userId = req.user._id || req.user;
        const accounts = await accountModel.find({ user: userId }).sort({ createdAt: -1 });
        res.status(200).json(accounts);
    } catch (err) {
        res.status(500).json({ message: "Error fetching accounts.", error: err });
    }
}

module.exports = {
    createAccountController,
    getUserAccountsController
};