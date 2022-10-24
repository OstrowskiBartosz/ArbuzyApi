const userService = require('../services/user.service');

const getUser = async (req, res) => {
  try {
    const session = req.session.login ?? null;
    if (!session) return res.status(401).send(JSON.stringify({ message: 'No active session.' }));

    const user = await userService.getUser(session);
    const { status, data, message } = user;
    res.status(status).send(JSON.stringify({ data: data, message: message }));
  } catch (e) {
    res.status(400).send(JSON.stringify({ message: e.message }));
  }
};

const createUser = async (req, res) => {
  try {
    const session = req.session;
    const userData = req.body ?? null;
    if (!userData) return res.status(401).send(JSON.stringify({ message: 'No req data.' }));

    const user = await userService.createUser(userData, session);
    const { status, data, message } = user;
    res.status(status).send(JSON.stringify({ data: data, message: message }));
  } catch (e) {
    res.status(400).send(JSON.stringify({ message: e.message }));
  }
};

const updateUser = async (req, res) => {
  try {
    const session = req.session.login ?? null;
    if (!session) return res.status(401).send(JSON.stringify({ message: 'No active session.' }));
    const userData = req.body ?? null;
    if (!userData) return res.status(401).send(JSON.stringify({ message: 'No req data.' }));

    const user = await userService.updateUser(session, userData);
    const { status, data, message } = user;
    res.status(status).send(JSON.stringify({ message: message }));
  } catch (e) {
    res.status(400).send(JSON.stringify({ message: e.message }));
  }
};

const deleteUser = async (req, res) => {
  try {
    const session = req.session.login ?? null;
    if (!session) return res.status(401).send(JSON.stringify({ message: 'No active session.' }));
    const sessionData = req.session;

    const user = await userService.deleteUser(session, sessionData);
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
