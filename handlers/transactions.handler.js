const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const transactionSchema = require('../validation/transactions.validator');

async function createTransaction(req, res, next) {
  try {
    const { source_account_id, destination_account_id, amount } = req.body;

    const { error } = await transactionSchema.validate({
      source_account_id,
      destination_account_id,
      amount,
    });

    if (error) {
      return res.status(400).json({ status: false, message: error.details[0].message });
    }

    if (source_account_id == null && destination_account_id == null) {
      res.json({ status: false, message: `Transaction failed!` });
    } else if (destination_account_id == null) {
      const bank_account = await prisma.bank_accounts.findUnique({
        where: {
          id: Number(source_account_id),
        },
      });

      if (!bank_account) {
        res.json({ status: false, message: `The source account does not exist` });
      } else if (bank_account.balance < amount) {
        res.json({ status: false, message: `Low balance source account` });
      } else {
        const result = await prisma.transactions.create({
          data: {
            source_account_id: Number(source_account_id),
            amount: Number(amount),
          },
        });

        await prisma.bank_accounts.update({
          where: {
            id: Number(source_account_id),
          },
          data: {
            balance: bank_account.balance - Number(amount),
          },
        });

        res.status(201).json({
          status: true,
          message: 'Withdrawal transaction was successful',
          data: result,
        });
      }
    } else if (source_account_id == null) {
      const bank_account = await prisma.bank_accounts.findUnique({
        where: {
          id: Number(destination_account_id),
        },
      });

      if (!bank_account) {
        res.json({ status: false, message: `The destination account does not exist` });
      } else {
        const result = await prisma.transactions.create({
          data: {
            destination_account_id: Number(destination_account_id),
            amount: Number(amount),
          },
        });

        await prisma.bank_accounts.update({
          where: {
            id: Number(destination_account_id),
          },
          data: {
            balance: bank_account.balance + Number(amount),
          },
        });

        res.status(201).json({
          status: true,
          message: 'Deposit transaction was successful',
          data: result,
        });
      }
    } else {
      const source_bank_account = await prisma.bank_accounts.findUnique({
        where: {
          id: Number(source_account_id),
        },
      });

      const destination_bank_account = await prisma.bank_accounts.findUnique({
        where: {
          id: Number(destination_account_id),
        },
      });

      if (!source_bank_account) {
        res.json({ status: false, message: `The source account does not exist` });
      } else if (!destination_bank_account) {
        res.json({ status: false, message: `The destination account does not exist` });
      } else if (source_account_id == destination_account_id) {
        res.json({ status: false, message: `Source account id and destination account id cannot be the same` });
      } else if (source_bank_account.balance < amount) {
        res.json({ status: false, message: `Low balance source account` });
      } else {
        const result = await prisma.transactions.create({
          data: {
            source_account_id: Number(source_account_id),
            destination_account_id: Number(destination_account_id),
            amount: Number(amount),
          },
        });

        await prisma.bank_accounts.update({
          where: {
            id: Number(source_account_id),
          },
          data: {
            balance: source_bank_account.balance - Number(amount),
          },
        });

        await prisma.bank_accounts.update({
          where: {
            id: Number(destination_account_id),
          },
          data: {
            balance: destination_bank_account.balance + Number(amount),
          },
        });

        res.status(201).json({
          status: true,
          message: 'Transfer transaction successful',
          data: result,
        });
      }
    }
  } catch (err) {
    next(err);
  }
}

async function indexTransactions(req, res, next) {
  const result = await prisma.transactions.findMany({
    orderBy: {
      id: 'asc',
    },
  });

  res.status(200).json({
    status: true,
    message: 'OK',
    data: result,
  });
}

async function showTransaction(req, res, next) {
  const { transactionId } = req.params;
  const transaction = await prisma.transactions.findUnique({
    where: {
      id: Number(transactionId),
    },
  });

  if (!transaction) {
    res.send(`Id transaction doesn't not exist`);
  }

  if (transaction.destination_account_id == null) {
    const source_bank_account = await prisma.bank_accounts.findUnique({
      where: {
        id: transaction.source_account_id,
      },
    });

    const source_user = await prisma.users.findUnique({
      where: {
        id: source_bank_account.user_id,
      },
    });
    res.status(200).json({
      status: true,
      message: 'OK',
      data: {
        id: transaction.id,
        source_account_id: transaction.source_account_id,
        source_name: source_user.name,
        source_bank_name: source_bank_account.bank_name,
        source_bank_account_number: source_bank_account.bank_account_number,
      },
    });
  }

  if (transaction.source_account_id == null) {
    const destination_bank_account = await prisma.bank_accounts.findUnique({
      where: {
        id: transaction.destination_account_id,
      },
    });

    const destination_user = await prisma.users.findUnique({
      where: {
        id: destination_bank_account.user_id,
      },
    });
    res.status(200).json({
      status: true,
      message: 'OK',
      data: {
        id: transaction.id,
        destination_account_id: transaction.destination_account_id,
        destination_name: destination_user.name,
        destination_bank_name: destination_bank_account.bank_name,
        destination_bank_account_number: destination_bank_account.bank_account_number,
      },
    });
  }

  if (transaction.source_account_id !== null && transaction.destination_account_id !== null) {
    const source_bank_account = await prisma.bank_accounts.findUnique({
      where: {
        id: transaction.source_account_id,
      },
    });
    const destination_bank_account = await prisma.bank_accounts.findUnique({
      where: {
        id: transaction.destination_account_id,
      },
    });

    const source_user = await prisma.users.findUnique({
      where: {
        id: source_bank_account.user_id,
      },
    });
    const destination_user = await prisma.users.findUnique({
      where: {
        id: destination_bank_account.user_id,
      },
    });

    res.status(200).json({
      status: true,
      message: 'OK',
      data: {
        id: transaction.id,
        source_account_id: transaction.source_account_id,
        source_name: source_user.name,
        source_bank_name: source_bank_account.bank_name,
        source_bank_account_number: source_bank_account.bank_account_number,
        destination_account_id: transaction.destination_account_id,
        destination_name: destination_user.name,
        destination_bank_name: destination_bank_account.bank_name,
        destination_bank_account_number: destination_bank_account.bank_account_number,
      },
    });
  }
}

module.exports = { createTransaction, indexTransactions, showTransaction };
