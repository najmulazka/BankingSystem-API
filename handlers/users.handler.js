const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const userSchema = require('../validation/users.validator');

async function createUser(req, res, next) {
  try {
    const { name, email, password, identity_type, identity_number, address } = req.body;
    const { error } = await userSchema.validate({
      name,
      email,
      password,
      identity_type,
      identity_number,
      address,
    });

    if (error) {
      return res.status(400).json({ status: false, message: error.details[0].message });
    }

    const existEmail = await prisma.users.findUnique({
      where: {
        email: email,
      },
    });

    const existIdentityNumber = await prisma.profiles.findUnique({
      where: {
        identity_number: identity_number,
      },
    });

    if (existEmail) {
      res.json({ status: false, message: `Post with email : ${email} already` });
    } else if (existIdentityNumber) {
      res.json({ status: false, message: `Post with identity number : ${identity_number} already` });
    } else {
      const result = await prisma.$transaction(async (prisma) => {
        const users = await prisma.users.create({
          data: {
            name: name,
            email: email,
            password: password,
          },
        });

        const profiles = await prisma.profiles.create({
          data: {
            user_id: users.id,
            identity_type: identity_type,
            identity_number: identity_number,
            address: address,
          },
        });
        return { users, profiles };
      });

      res.status(201).json({
        status: true,
        message: 'User Created!',
        data: result,
      });
    }
  } catch (err) {
    next(err);
  }
}

async function indexUsers(req, res, next) {
  try {
    const result = await prisma.users.findMany({
      orderBy: {
        id: 'asc',
      },
    });

    res.status(200).json({
      status: true,
      message: 'OK!',
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

async function showUser(req, res, next) {
  try {
    const { userId } = req.params;
    const result = await prisma.users.findUnique({
      where: {
        id: Number(userId),
      },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        profiles: {
          select: {
            identity_type: true,
            identity_number: true,
            address: true,
          },
        },
      },
    });

    if (!result) {
      res.status(400).json({ status: false, message: `Post with ID ${req.params.userId} doesn't not exist` });
    } else {
      res.status(200).json({
        status: true,
        message: 'OK!',
        data: result,
      });
    }
  } catch (err) {
    next(err);
  }
}

module.exports = { createUser, indexUsers, showUser };
