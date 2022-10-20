const sessionService = require('../services/session.service');

const createSession = async (req, res) => {
  try {
    const { login, password } = req.body;
    if (login && password) {
      const session = req.session;
      const createSession = await sessionService.createSession(session, login, password);
      const { status, data, message } = createSession;
      res.status(status).send(JSON.stringify({ data: data, message: message }));
    } else {
      res.status(400).send(JSON.stringify({ message: 'No requested data.' }));
    }
  } catch (e) {
    res.status(400).send(JSON.stringify({ message: e.message }));
  }
};

const getSession = async (req, res) => {
  try {
    const session = req.session;
    const userSIDCookie = req.headers.cookie;
    if (session && userSIDCookie) {
      const getSession = await sessionService.getSession(session, userSIDCookie);
      const { status, data, message } = getSession;
      if (getSession.message === 'Logged.') {
        res.status(status).send({ data: data, message: message });
      } else {
        res.clearCookie('user_sid');
        res.status(status).send(JSON.stringify({ data: data, message: message }));
      }
    } else res.send(JSON.stringify({ status: 400, message: 'No requested data.' }));
  } catch (e) {
    res.send(JSON.stringify({ status: 400, message: e.message }));
  }
};

const deleteSession = async (req, res) => {
  try {
    const session = req.session;
    const userSIDCookie = req.headers.cookie;
    if (session && userSIDCookie) {
      const deleteSession = await sessionService.deleteSession(session, userSIDCookie);
      const { status, data, message } = deleteSession;
      res.clearCookie('user_sid');
      res.status(status).send(JSON.stringify({ data: data, message: message }));
    } else res.status(400).send(JSON.stringify({ message: 'No requested data.' }));
  } catch (e) {
    res.send(JSON.stringify({ status: 400, message: e.message }));
  }
};

module.exports = {
  createSession,
  getSession,
  deleteSession
};
