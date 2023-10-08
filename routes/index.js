const express = require('express');
const router = express.Router();
const users = require('./users.route');
const accounts = require('./accounts.route');
const transactions = require('./transactions.route');

router.get('/', (req, res) => {
  res.send('WELCOME TO API');
});

router.use('/users', users);
router.use('/accounts', accounts);
router.use('/transactions', transactions);

module.exports = router;
