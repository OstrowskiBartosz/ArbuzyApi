const db = require('../../models');
const { Cart } = db;
const checkCurrentProductPrice = require('../cartItem/checkCurrentProductPrice');

const financial = (string) => Number.parseFloat(string).toFixed(2);

module.exports = checkCartPrice = async (cart, cartItems, transaction) => {
  let totalPriceOfProducts = 0;
  cartItems.forEach((cartItem) => {
    const productPrice = checkCurrentProductPrice(cartItem.Product);
    totalPriceOfProducts += productPrice * cartItem.quantity;
  });

  if (financial(cart.totalPriceOfProducts) !== financial(totalPriceOfProducts)) {
    await Cart.update(
      { totalPriceOfProducts: totalPriceOfProducts },
      { where: { userID: user.userID }, transaction: transaction }
    );

    const cartData = await Cart.findOne({
      attributes: { exclude: ['userID'] },
      where: { userID: user.userID },
      transaction: transaction
    });
    return cartData;
  }
  return cart;
};
