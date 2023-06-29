const db = require('../../models');
const { CartItem, Cart } = db;

module.exports = resetCart = async (cartID, userID, transaction) => {
  await CartItem.destroy({
    where: { cartID: cartID },
    transaction: transaction
  });
  await Cart.destroy({
    where: { userID: userID },
    transaction: transaction
  });
};
