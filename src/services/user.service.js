const db = require('../models');
const { User } = db;
const { Op } = require('sequelize');
const checkUserLogged = require('../util/user/checkUserLogged');
const createNewUser = require('../util/user/createNewUser');

const getUser = async (userSession) => {
  try {
    const transaction = await db.sequelize.transaction();
    const user = await checkUserLogged(userSession, transaction);

    const userData = await User.findOne({
      where: { userID: user.userID },
      attributes: {
        exclude: ['userID', 'password', 'userType', 'phoneNumber', 'comment', 'VATNumber']
      },
      transaction: transaction
    });
    transaction.commit();
    return { status: 200, data: userData, message: 'Successfully user retrieved data.' };
  } catch (e) {
    transaction.rollback();
    return { status: 500, data: null, message: e.message };
  }
};

const createUser = async (userData, session) => {
  try {
    const transaction = await db.sequelize.transaction();
    const { login, email } = userData;
    const findUser = await User.findOne({
      where: { [Op.or]: [{ login: login }, { email: email }] },
      transaction: transaction
    });
    if (findUser === null) {
      const user = await createNewUser(userData, transaction);
      if (user) {
        session.login = login;
        session.save();
        transaction.commit();
        return { status: 200, data: null, message: 'User has been signed up.' };
      } else {
        transaction.rollback();
        return { status: 200, data: null, message: 'Error creating new user.' };
      }
    } else {
      transaction.rollback();
      return { status: 200, data: null, message: 'User with that login or email already exists.' };
    }
  } catch (e) {
    transaction.rollback();
    return { status: 500, data: null, message: e.message };
  }
};

const updateUser = async (userSession, userData) => {
  try {
    const transaction = await db.sequelize.transaction();
    const user = await checkUserLogged(userSession, transaction);

    const userUpdate = await User.update(
      {
        firstName: userData.firstName,
        lastName: userData.lastName,
        cityName: userData.cityName,
        streetName: userData.streetName,
        ZIPCode: userData.ZIPCode,
        VATNumber: userData.VATNumber !== '' ? userData.VATNumber : null,
        companyName: userData.companyName !== '' ? userData.companyName : null
      },
      { where: { userID: user.userID }, transaction: transaction }
    );
    transaction.commit();
    return { status: 200, data: null, message: 'User has been updated.' };
  } catch (e) {
    transaction.rollback();
    return { status: 500, data: null, message: e.message };
  }
};

const deleteUser = async (userSession, session) => {
  try {
    const transaction = await db.sequelize.transaction();
    const user = await checkUserLogged(userSession, transaction);

    const deleteUser = await User.destroy({
      where: { userID: user.userID },
      transaction: transaction
    });
    session.destroy();
    transaction.commit();
    return { status: 200, data: null, message: 'User has been deleted.' };
  } catch (e) {
    transaction.rollback();
    return { status: 500, data: null, message: e.message };
  }
};

module.exports = {
  createUser,
  updateUser,
  deleteUser,
  getUser
};
