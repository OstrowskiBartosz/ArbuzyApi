const db = require('../../models');
const { User } = db;
const generatePasswordHash = require('./generatePasswordHash');

module.exports = createNewUser = async (userData, transaction) => {
  try {
    const user = await User.create(
      {
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
        NIPNumber: userData.NIPNumber ? userData.NIPNumber : null,
        companyName: userData.companyName ? userData.companyName : null
      },
      { transaction: transaction }
    );
    return user;
  } catch (e) {
    throw 'Error creating new user.';
  }
};
