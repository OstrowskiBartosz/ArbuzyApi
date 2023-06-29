const db = require('../../models');
const { User } = db;

module.exports = checkUserLogged = async (userSession, transaction) => {
  const user = await User.findOne({ where: { login: userSession }, transaction: transaction });
  if (user === null) {
    await transaction.rollback();
    return { status: 401, data: null, message: 'No active session.' };
  }
  return user;
};
