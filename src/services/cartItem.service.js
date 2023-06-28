const db = require('../models');
const { Cart, CartItem, Product, Price } = db;
const { Op } = require('sequelize');
const checkUserLogged = require('../util/checkUserLogged');
const checkCurrentProductPrice = require('../util/cartItem/checkCurrentProductPrice');
const updateCartItemQuantity = require('../util/cartItem/updateCartItemQuantity');
const updateCartTotalPrice = require('../util/cartItem/updateCartTotalPrice');
const cartItemDetails = require('../util/cartItem/cartItemDetails');

const postCartItem = async (userSession, productID) => {
  try {
    const transaction = await db.sequelize.transaction();
    const user = await checkUserLogged(userSession, transaction);
    const [cart, cartCreated] = await Cart.findOrCreate({
      where: { userID: user.userID },
      defaults: { userID: user.userID },
      transaction: transaction
    });

    const product = await Product.findOne({
      where: { productID: productID },
      include: [{ model: Price }],
      transaction: transaction
    });

    if (product && product.quantity > 0) {
      const [cartItem, cartItemCreated] = await CartItem.findOrCreate({
        where: { [Op.and]: [{ cartID: cart.cartID }, { productID: productID }] },
        defaults: { cartID: cart.cartID, productID: productID, quantity: 1 },
        transaction: transaction
      });
      if (!cartItemCreated) {
        if (cartItem.quantity >= product.quantity) {
          await transaction.rollback();
          return { status: 200, data: null, message: 'Quantity limit.' };
        } else if (cartItem.quantity < product.quantity) {
          updateCartItemQuantity(cartItem, '+', cartItem.cartItemID, false, 1, transaction);
          const productPrice = checkCurrentProductPrice(product);
          await updateCartTotalPrice(productPrice, '+', user.userID, false, 1, transaction);
        }
      } else if (cartItemCreated) {
        const productPrice = checkCurrentProductPrice(product);
        await updateCartTotalPrice(productPrice, '+', user.userID, true, 1, transaction);
      }
      await transaction.commit();
      return { status: 200, data: null, message: 'Product has been added to cart.' };
    } else {
      await transaction.rollback();
      return { status: 200, data: null, message: 'Quantity limit.' };
    }
  } catch (e) {
    await transaction.rollback();
    return { status: 500, data: null, message: e.message };
  }
};

const deleteCartItem = async (userSession, cartItemID) => {
  try {
    const transaction = await db.sequelize.transaction();
    const user = await checkUserLogged(userSession, transaction);

    const cartItemInfo = await cartItemDetails(cartItemID, transaction);

    const productPrice = checkCurrentProductPrice(cartItemInfo.Product);
    const cartItemQuantity = cartItemInfo.quantity;
    const userCart = await Cart.findOne({ where: { userID: user.userID } });
    await updateCartTotalPrice(productPrice, '-', user.userID, true, cartItemQuantity, transaction);

    const cartItemDelete = await CartItem.destroy({
      where: { cartItemID: cartItemID },
      transaction: transaction
    });

    await transaction.commit();
    return { status: 200, data: [], message: 'Product has been removed from the cart.' };
  } catch (e) {
    await transaction.rollback();
    return { status: 500, data: [], message: e.message };
  }
};

const updateCartItem = async (userSession, cartItemID, operationSign) => {
  try {
    const transaction = await db.sequelize.transaction();
    const user = await checkUserLogged(userSession, transaction);

    const cartItemInfo = await cartItemDetails(cartItemID, transaction);

    const productPrice = checkCurrentProductPrice(cartItemInfo.Product);
    const availableQuantity = cartItemInfo.Product.quantity;
    const cartQuantity = cartItemInfo.quantity;
    if (operationSign === '+' && availableQuantity > cartQuantity) {
      await updateCartItemQuantity(cartItemInfo, operationSign, cartItemID, transaction);
      await updateCartTotalPrice(productPrice, operationSign, user.userID, false, 1, transaction);
      await transaction.commit();
      return { status: 200, data: null, message: 'The quantity has been updated.' };
    } else if (operationSign === '-' && cartQuantity > 1 && availableQuantity >= cartQuantity) {
      await updateCartItemQuantity(cartItemInfo, operationSign, cartItemID, transaction);
      await updateCartTotalPrice(productPrice, operationSign, user.userID, false, 1, transaction);
      await transaction.commit();
      return { status: 200, data: null, message: 'The quantity has been updated.' };
    }
    await transaction.rollback();
    return { status: 400, data: null, message: 'Quantity limit.' };
  } catch (e) {
    await transaction.rollback();
    return { status: 500, data: null, message: e.message };
  }
};

module.exports = {
  postCartItem,
  deleteCartItem,
  updateCartItem
};
