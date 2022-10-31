const cartItemService = require('../services/cartItem.service');

const postCartItem = async (req, res) => {
  try {
    const { login: session } = req.session;
    if (!session) return res.status(401).send(JSON.stringify({ message: 'No active session.' }));
    const quantity = req.body.quantity ?? null;
    const productID = req.body.productID ?? null;
    if (!productID || !quantity)
      return res.status(401).send(JSON.stringify({ message: 'No req data.' }));

    const cartItem = await cartItemService.postCartItem(session, productID, quantity);
    const { status, data, message } = cartItem;
    res.status(status).send(JSON.stringify({ message: message }));
  } catch (e) {
    res.status(400).send(JSON.stringify({ status: 400, message: e.message }));
  }
};

const deleteCartItem = async (req, res) => {
  try {
    const { login: session } = req.session;
    if (!session) return res.status(401).send(JSON.stringify({ message: 'No active session.' }));
    const cartItemID = req.params.cartItemID ?? null;
    if (!cartItemID) return res.status(401).send(JSON.stringify({ message: 'No req data.' }));

    const cartItem = await cartItemService.deleteCartItem(session, cartItemID);
    const { status, data, message } = cartItem;
    res.status(status).send(JSON.stringify({ data: data, message: message }));
  } catch (e) {
    res.status(400).send(JSON.stringify({ status: 400, message: e.message }));
  }
};

const updateCartItem = async (req, res) => {
  try {
    const { login: session } = req.session;
    if (!session) return res.status(401).send(JSON.stringify({ message: 'No active session.' }));
    const cartItemID = req.params.cartItemID ?? null;
    const operationSign = req.params.operationSign ?? null;
    if (!cartItemID || !operationSign)
      return res.status(401).send(JSON.stringify({ message: 'No req data.' }));

    const cartItem = await cartItemService.updateCartItem(session, cartItemID, operationSign);
    const { status, data, message } = cartItem;
    res.status(status).send(JSON.stringify({ message: message }));
  } catch (e) {
    res.status(400).send(JSON.stringify({ status: 400, message: e.message }));
  }
};

module.exports = {
  postCartItem,
  deleteCartItem,
  updateCartItem
};
