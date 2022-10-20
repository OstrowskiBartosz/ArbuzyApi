const bcrypt = require('bcrypt');

module.exports = generatePasswordHash = async (password) => {
  const saltRounds = 10;
  const generatedSalt = await bcrypt.genSalt(saltRounds);
  const generatedHash = await bcrypt.hash(password, generatedSalt);
  return generatedHash;
};
