const db = require('../../models');
const { Cart } = db;

module.exports = updateCartTotalPrice = async (
  productPrice,
  operationSign,
  userID,
  changeNumberOfProducts,
  cartQuantity,
  transaction
) => {
  const userCart = await Cart.findOne({ where: { userID: userID }, transaction: transaction });
  if (operationSign === '+') {
    const cartUpdate = await Cart.update(
      {
        totalQuantityofProducts: userCart.totalQuantityofProducts + cartQuantity,
        totalPriceOfProducts: userCart.totalPriceOfProducts + productPrice * cartQuantity
      },
      { where: { userID: userID }, transaction: transaction }
    );
    if (changeNumberOfProducts) {
      await Cart.increment('numberOfProducts', { by: 1, where: { userID: userID }, transaction: transaction });
    }
  } else if (operationSign === '-') {
    const cartUpdate = await Cart.update(
      {
        totalQuantityofProducts: userCart.totalQuantityofProducts - cartQuantity,
        totalPriceOfProducts: userCart.totalPriceOfProducts - productPrice * cartQuantity
      },
      { where: { userID: userID }, transaction: transaction }
    );
    if (changeNumberOfProducts) {
      await Cart.decrement('numberOfProducts', { by: 1, where: { userID: userID }, transaction: transaction });
    }
  }
};
