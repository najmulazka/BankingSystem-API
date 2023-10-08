const express = require('express');
const router = express.Router();
const { createUser, indexUsers, showUser } = require('../handlers/users.handler');

router.post('/', createUser);
router.get('/', indexUsers);
router.get('/:userId', showUser);

module.exports = router;
