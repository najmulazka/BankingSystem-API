const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const accountSchema = require('../validation/accounts.validator');

async function createAccount(req, res, next) {
  try {
    const { user_id, bank_name, bank_account_number, balance } = req.body;

    const { error } = await accountSchema.validate({
      user_id,
      bank_name,
      bank_account_number,
      balance,
    });

    if (error) {
      return res.status(400).json({ status: false, message: error.details[0].message });
    }

    const existUser = await prisma.users.findUnique({
      where: {
        id: Number(user_id),
      },
    });

    const existAccountNumber = await prisma.bank_accounts.findUnique({
      where: {
        bank_account_number,
      },
    });

    if (!existUser) {
      res.status(400).json({ status: false, message: `Post user id ${user_id} doesn't not exist` });
    } else if (existAccountNumber) {
      res.status(400).json({ status: false, message: `Post with bank account number : ${bank_account_number} already` });
    } else {
      const result = await prisma.bank_accounts.create({
        data: {
          user_id,
          bank_name,
          bank_account_number,
          balance: Number(balance),
        },
      });

      res.status(201).json({
        status: true,
        message: 'Account Created!',
        data: result,
      });
    }
  } catch (err) {
    next(err);
  }
}

async function indexAccounts(req, res, next) {
  try {
    const result = await prisma.bank_accounts.findMany({
      orderBy: {
        id: 'asc',
      },
    });

    res.status(200).json({
      status: true,
      message: 'OK',
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

async function showAccount(req, res, next) {
  try {
    const { accountId } = req.params;
    const result = await prisma.bank_accounts.findUnique({
      where: {
        id: Number(accountId),
      },
      select: {
        id: true,
        users: {
          select: {
            name: true,
          },
        },
        bank_name: true,
        bank_account_number: true,
        balance: true,
      },
    });

    if (!result) {
      res.status(400).json({ status: false, message: `Post with id ${req.params.accountId} doesn't not exist` });
    } else {
      res.status(200).json({
        status: true,
        message: `OK`,
        data: result,
      });
    }
  } catch (err) {
    next(err);
  }
}

module.exports = { createAccount, indexAccounts, showAccount };
