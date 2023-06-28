const db = require('../models');
const { Cart, CartItem } = db;
const checkUserLogged = require('../util/checkUserLogged');
const checkCartPrice = require('../util/cart/checkCartPrice');
const shoppingCartData = require('../util/cartItem/shoppingCartData');

const getCartItemsNumber = async (userSession) => {
  try {
    const transaction = await db.sequelize.transaction();
    const user = await checkUserLogged(userSession, transaction);

    const cart = await Cart.findOne({ where: { userID: user.userID } });
    if (!cart) {
      transaction.rollback();
      return { status: 200, data: { numberOfProducts: 0 }, message: 'No cart.' };
    } else {
      transaction.commit();
      return { status: 200, data: { numberOfProducts: cart.numberOfProducts }, message: 'Cart found.' };
    }
  } catch (e) {
    transaction.rollback();
    return { status: 500, data: null, message: e.message };
  }
};

const getCart = async (userSession) => {
  try {
    const transaction = await db.sequelize.transaction();
    const user = await checkUserLogged(userSession, transaction);

    const [cart, cartCreated] = await Cart.findOrCreate({
      where: { userID: user.userID },
      defaults: { userID: user.userID },
      transaction: transaction
    });

    const shoppingCart = await shoppingCartData(cart.cartID, transaction);
    const cartData = await checkCartPrice(cart, shoppingCart, transaction);

    await transaction.commit();
    return { status: 200, data: { cartData: cartData, cartItemsData: shoppingCart }, message: 'Success.' };
  } catch (e) {
    await transaction.rollback();
    return { status: 500, data: null, message: e.message };
  }
};

const deleteCart = async (userSession, cartID) => {
  try {
    const transaction = await db.sequelize.transaction();
    await checkUserLogged(userSession, transaction);

    await CartItem.destroy({ where: { cartID: cartID }, transaction: transaction });
    await Cart.destroy({ where: { cartID: cartID }, transaction: transaction });

    await transaction.commit();
    return { status: 200, data: null, message: 'Cart has been deleted.' };
  } catch (e) {
    await await transaction.rollback();
    return { status: 500, data: null, message: e.message };
  }
};

module.exports = {
  getCart,
  getCartItemsNumber,
  deleteCart
};
