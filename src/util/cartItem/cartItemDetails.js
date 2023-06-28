const db = require('../../models');
const { CartItem, Product, Price } = db;

module.exports = cartItemDetails = async (cartItemID, transaction) => {
  return await CartItem.findOne({
    include: [
      {
        model: Product,
        attributes: ['productID', 'quantity', 'promotionName'],
        include: [{ model: Price, attributes: ['grossPrice'] }]
      }
    ],
    where: { cartItemID: cartItemID },
    transaction: transaction
  });
};
