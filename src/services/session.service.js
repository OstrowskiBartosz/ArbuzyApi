const db = require('../models');
const { User } = db;
const bcrypt = require('bcrypt');
const checkUserLogged = require('../util/checkUserLogged');

const createSession = async (session, login, password) => {
  try {
    const transaction = await db.sequelize.transaction();
    const user = await User.findOne({ where: { login: login }, transaction: transaction });

    if (user) {
      if (bcrypt.compareSync(password, user.password)) {
        session.login = login;
        session.save();
        transaction.commit();
        return { status: 200, data: null, message: 'Logged.' };
      } else {
        transaction.rollback();
        return { status: 200, data: [], message: 'Wrong combination of login and password.' };
      }
    } else {
      transaction.rollback();
      return { status: 200, data: [], message: 'Wrong combination of login and password.' };
    }
  } catch (e) {
    transaction.rollback();
    return { status: 500, data: [], message: e.message };
  }
};

const getSession = async (session, userSIDCookie) => {
  try {
    if (userSIDCookie) {
      session.regenerate(() => {
        session.save();
      });
      return { status: 200, data: null, message: 'Logged.' };
    } else {
      return { status: 200, data: null, message: 'Not logged.' };
    }
  } catch (e) {
    return { status: 500, data: null, message: e.message };
  }
};

const deleteSession = async (session, userIDCookie) => {
  try {
    if (session.login && userIDCookie) {
      session.destroy();
      return { status: 200, data: null, message: 'Logged out.' };
    } else return { status: 200, data: null, message: 'Logged out.' };
  } catch (e) {
    return { status: 500, data: null, message: e.message };
  }
};

module.exports = {
  createSession,
  getSession,
  deleteSession
};
