const express = require('express');
const router = express.Router();
const { createAccount, indexAccounts, showAccount } = require('../handlers/accounts.handler');

router.post('/', createAccount);
router.get('/', indexAccounts);
router.get('/:accountId', showAccount);

module.exports = router;
