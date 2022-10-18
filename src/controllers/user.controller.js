const userService = require('../services/user.service');

const getUser = async (req, res) => {
  try {
    const userSession = req.session.login;
    if (!userSession) {
      return res.status(401).send(JSON.stringify({ message: 'No active session.' }));
    }

    const user = await userService.getUser(userSession);
    const { status, data, message } = user;
    res.status(status).send(JSON.stringify({ data: data, message: message }));
  } catch (e) {
    res.status(400).send(JSON.stringify({ message: e.message }));
  }
};

const createUser = async (req, res) => {
  try {
    const userData = req.body;
    const session = req.session;

    const user = await userService.createUser(userData, session);
    const { status, data, message } = user;
    res.status(status).send(JSON.stringify({ data: data, message: message }));
  } catch (e) {
    res.status(400).send(JSON.stringify({ message: e.message }));
  }
};

const updateUser = async (req, res) => {
  try {
    const userData = req.body;
    const userSession = req.session.login;

    const user = await userService.updateUser(userSession, userData);
    const { status, data, message } = user;
    res.status(status).send(JSON.stringify({ message: message }));
  } catch (e) {
    res.status(400).send(JSON.stringify({ message: e.message }));
  }
};

const deleteUser = async (req, res) => {
  try {
    const userSession = req.session.login;
    const session = req.session;

    const user = await userService.deleteUser(userSession, session);
    res.clearCookie('user_sid');
    const { status, data, message } = user;
    res.status(status).send(JSON.stringify({ message: message }));
  } catch (e) {
    res.status(400).send(JSON.stringify({ message: e.message }));
  }
};

module.exports = {
  createUser,
  updateUser,
  deleteUser,
  getUser
};
