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
    return { status: 500, data: [], message: e.message };
  }
};

const getCart = async (session) => {
  try {
    const transaction = await db.sequelize.transaction();
    const user = await User.findOne({ where: { login: session } });
    if (user === null) return { status: 401, data: [], message: 'No active session.' };

    const cart = await Cart.findOne({
      attributes: { exclude: ['userID'] },
      where: { userID: user.userID },
      transaction: transaction
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
      ],
      transaction: transaction
    });

    let totalPriceOfProducts = 0;
    cartItems.forEach((cartItem) => {
      let productPrice = cartItem.Product.promotionName
        ? cartItem.Product.Prices[cartItem.Product.Prices.length - 1].grossPrice
        : cartItem.Product.Prices[0].grossPrice;
      totalPriceOfProducts += productPrice * cartItem.quantity;
    });

    const cartUpdate = await Cart.update(
      {
        totalPriceOfProducts: totalPriceOfProducts
      },
      { where: { userID: user.userID }, transaction: transaction }
    );

    const cartUpdated = await Cart.findOne({
      attributes: { exclude: ['userID'] },
      where: { userID: user.userID },
      transaction: transaction
    });

    await transaction.commit();
    return {
      status: 200,
      data: { cartData: cartUpdated, cartItemsData: cartItems },
      message: 'Success.'
    };
  } catch (e) {
    await transaction.rollback();
    console.log('2');
    return { status: 500, data: [], message: e.message };
  }
};

const deleteCart = async (session, cartID) => {
  const transaction = await db.sequelize.transaction();
  try {
    const user = await User.findOne({ where: { login: session } });
    if (user === null) {
      await transaction.rollback();
      return { status: 401, data: {}, message: 'No active session.' };
    }

    const cartItemDeleted = await CartItem.destroy({ where: { cartID: cartID }, transaction });
    const cartDeleted = await Cart.destroy({ where: { cartID: cartID }, transaction });
    await transaction.commit();
    return { status: 200, data: [], message: 'Cart has been deleted.' };
  } catch (e) {
    await await transaction.rollback();
    return { status: 500, data: [], message: e.message };
  }
};

module.exports = {
  getCart,
  getCartItemsNumber,
  deleteCart
};
