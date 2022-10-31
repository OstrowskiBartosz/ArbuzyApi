const db = require('../models');
const { User } = db;
const bcrypt = require('bcrypt');

const createSession = async (session, login, password) => {
  try {
    const user = await User.findOne({ where: { login: login } });
    if (user) {
      if (bcrypt.compareSync(password, user.password)) {
        session.login = login;
        session.save();
        return { status: 200, data: [], message: 'Logged.' };
      } else return { status: 200, data: [], message: 'Wrong combination of login and password.' };
    } else return { status: 200, data: [], message: 'Wrong combination of login and password.' };
  } catch (e) {
    return { status: 500, data: [], message: e.message };
  }
};

const getSession = async (session, userSIDCookie) => {
  try {
    if (userSIDCookie) {
      session.regenerate(() => {
        session.save();
      });
      return { status: 200, data: [], message: 'Logged.' };
    } else {
      return { status: 200, data: [], message: 'Not logged.' };
    }
  } catch (e) {
    return { status: 500, data: [], message: e.message };
  }
};

const deleteSession = async (session, userIDCookie) => {
  try {
    if (session.login && userIDCookie) {
      session.destroy();
      return { status: 200, data: [], message: 'Logged out.' };
    } else return { status: 200, data: [], message: 'Logged out.' };
  } catch (e) {
    return { status: 500, data: [], message: e.message };
  }
};

module.exports = {
  createSession,
  getSession,
  deleteSession
};
