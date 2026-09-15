const accountModel = require('../models/account.model');


async function createAccountController(req, res) {
    try {
        const userId = req.user;

        const account = await accountModel.create({
            user: userId,
        });
        res.status(201).json(account);
    }
    catch (err) {
        res.status(500).json({ message: "Error creating account.", error: err });
    }
}

module.exports = {
    createAccountController
};