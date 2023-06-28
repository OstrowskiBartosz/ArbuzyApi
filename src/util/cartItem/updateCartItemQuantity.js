const db = require('../../models');
const { CartItem } = db;

module.exports = updateCartItemQuantity = async (
  cartItemInfo,
  operationSign,
  cartItemID,
  transaction
) => {
  if (operationSign === '+') {
    const cartItemUpdate = await CartItem.update(
      { quantity: cartItemInfo.quantity + 1 },
      { where: { cartItemID: cartItemID }, transaction: transaction }
    );
  } else if (operationSign === '-') {
    const cartItemUpdate = await CartItem.update(
      { quantity: cartItemInfo.quantity - 1 },
      { where: { cartItemID: cartItemID }, transaction: transaction }
    );
  }
};
