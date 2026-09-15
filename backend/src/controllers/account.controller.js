const accountModel = require('../models/account.model');


async function createAccountController(req, res) {
    try {
        const userId = req.user;
        const userId = req.user._id || req.user;
        const currency = req.body?.currency || 'INR';

        const account = await accountModel.create({
            user: userId,
            currency: currency
        });
        res.status(201).json(account);
    }
    catch (err) {
        res.status(500).json({ message: "Error creating account.", error: err });
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
    createAccountController
    createAccountController,
    getUserAccountsController
};