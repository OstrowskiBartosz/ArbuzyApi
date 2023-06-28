const db = require('../../models');
const { CartItem, Price, Product, Attribute, Manufacturer } = db;

module.exports = shoppingCartData = async (cartID, transaction) => {
  const cartItems = await CartItem.findAll({
    include: [
      {
        model: Product,
        include: [
          {
            model: Price,
            attributes: {
              exclude: ['productID', 'priceID', 'netPrice', 'taxPercentage', 'fromDate', 'toDate']
            }
          },
          {
            model: Manufacturer,
            as: 'Manufacturer',
            attributes: {
              exclude: ['manufacturerID']
            }
          },
          {
            model: Attribute,
            as: 'Attributes',
            attributes: {
              exclude: ['attributeID', 'productID', 'property', 'type']
            },
            where: { type: 2 }
          }
        ],
        attributes: {
          exclude: ['description', 'manufacturerID', 'quantity']
        }
      }
    ],
    where: { cartID: cartID },
    transaction: transaction
  });
  return cartItems;
};
