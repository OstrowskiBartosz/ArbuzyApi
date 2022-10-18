const generatePasswordHash = require('../utilFunctions/generatePasswordHash');
const db = require('../models');
const { User } = db;
// const generatePasswordHash = require('../utilFunctions/generatePasswordHash');

const getUser = async (userSession) => {
  try {
    const user = await User.findOne({ where: { login: userSession } });
    if (user === null) return { status: 401, data: [], message: 'No active session.' };

    const userData = await User.findOne({
      where: { userID: user.userID },
      attributes: {
        exclude: [
          'userID',
          'login',
          'password',
          'email',
          'userType',
          'phoneNumber',
          'comment',
          'VATNumber'
        ]
      }
    });
    return { status: 200, data: userData, message: 'Successfully user retrieved data.' };
  } catch (e) {
    throw Error(e);
  }
};

const createUser = async (userData, session) => {
  try {
    const { login, email } = userData;
    const findUser = await User.findOne({ where: { login: login, email: email } });

    if (findUser === null) {
      const user = await User.create({
        login: userData.login,
        password: await generatePasswordHash(userData.password),
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phoneNumber: userData.phoneNumber,
        cityName: userData.cityName,
        streetName: userData.streetName,
        ZIPCode: `${userData.ZIPCode.slice(0, 2)}-${userData.ZIPCode.slice(2)}`,
        userType: 1,
        NIPNumber: userData.NIPNumber !== '' ? userData.NIPNumber : null,
        companyName: userData.companyName !== '' ? userData.companyName : null
      });
      session.login = login;
      session.save();
      return { status: 200, data: [], message: 'signedup' };
    } else {
      return { status: 200, data: [], message: 'User with that login or email already exists.' };
    }
  } catch (e) {
    throw Error(e);
  }
};

const updateUser = async (userSession, userData) => {
  try {
    const user = await User.findOne({ where: { login: userSession } });
    if (user === null) return { status: 401, data: [], message: 'No active session.' };

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
      { where: { userID: user.userID } }
    );
    return { status: 200, data: [], message: 'User has been updated.' };
  } catch (e) {
    throw Error(e);
  }
};

const deleteUser = async (userSession, session) => {
  try {
    const user = await User.findOne({ where: { login: userSession } });
    if (user === null) return { status: 401, data: [], message: 'No active session.' };

    const deleteUser = await User.destroy({ where: { userID: user.userID } });
    session.destroy();
    return { status: 200, data: [], message: 'User has been deleted.' };
  } catch (e) {
    throw Error(e);
  }
};

module.exports = {
  createUser,
  updateUser,
  deleteUser,
  getUser
};
