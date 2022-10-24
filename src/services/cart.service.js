const db = require('../models');
const { Cart, CartItem, Price, Product, Attribute, Manufacturer, User } = db;

const getCartItemsNumber = async (session) => {
  try {
    const user = await User.findOne({ where: { login: session } });
    if (user === null) return { status: 401, data: {}, message: 'No active session.' };
    const cart = await Cart.findOne({ where: { userID: user.userID } });
    if (cart === null) return { status: 200, data: { numberOfProducts: 0 }, message: 'No cart.' };
    return {
      status: 200,
      data: { numberOfProducts: cart.numberOfProducts },
      message: 'Cart found.'
    };
  } catch (e) {
    throw Error(e);
  }
};

const getCart = async (session) => {
  try {
    const user = await User.findOne({ where: { login: session } });
    if (user === null) return { status: 401, data: [], message: 'No active session.' };

    const cart = await Cart.findOne({
      attributes: { exclude: ['userID'] },
      where: { userID: user.userID }
    });

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
      ]
    });

    return { status: 200, data: { cartData: cart, cartItemsData: cartItems }, message: 'Success.' };
  } catch (e) {
    throw Error(e);
  }
};

const deleteCart = async (session, cartID) => {
  try {
    const user = await User.findOne({ where: { login: session } });
    if (user === null) return { status: 401, data: {}, message: 'No active session.' };
    const cartItemDeleted = await CartItem.destroy({ where: { cartID: cartID } });
    const cartDeleted = await Cart.destroy({ where: { cartID: cartID } });
    return { status: 200, data: [], message: 'Cart has been deleted.' };
  } catch (e) {
    throw Error(e);
  }
};

module.exports = {
  getCart,
  getCartItemsNumber,
  deleteCart
};
