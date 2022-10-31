const cartService = require('../services/cart.service');

const getCartItemsNumber = async (req, res) => {
  try {
    const { login: session } = req.session;
    if (!session) return res.status(401).send(JSON.stringify({ message: 'No active session.' }));

    const cart = await cartService.getCartItemsNumber(session);
    const { status, data, message } = cart;
    res.status(status).send(JSON.stringify({ data: data, message: message }));
  } catch (e) {
    res.status(400).send(JSON.stringify({ data: [], message: e.message }));
  }
};

const getCart = async (req, res) => {
  try {
    const { login: session } = req.session;
    if (!session) return res.status(401).send(JSON.stringify({ message: 'No active session.' }));

    const cart = await cartService.getCart(session);
    const { status, data, message } = cart;
    res.status(status).send(JSON.stringify({ data: data, message: message }));
  } catch (e) {
    res.status(400).send(JSON.stringify({ data: [], message: e.message }));
  }
};

const deleteCart = async (req, res) => {
  try {
    const { login: session } = req.session;
    if (!session) return res.status(401).send(JSON.stringify({ message: 'No active session.' }));
    const { cartID } = req.params;
    if (!cartID) return res.status(400).send(JSON.stringify({ message: 'No cartID data.' }));

    const cart = await cartService.deleteCart(session, cartID);
    const { status, data, message } = cart;
    res.status(status).send(JSON.stringify({ data: data, message: message }));
  } catch (e) {
    res.status(400).send(JSON.stringify({ status: 400, message: e.message }));
  }
};

module.exports = {
  getCart,
  getCartItemsNumber,
  deleteCart
};
