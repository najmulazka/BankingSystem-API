const express = require('express');
const router = express.Router();
const { createTransaction, indexTransactions, showTransaction } = require('../handlers/transactions.handler');

router.post('/', createTransaction);
router.get('/', indexTransactions);
router.get('/:transactionId', showTransaction);

module.exports = router;
