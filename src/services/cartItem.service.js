const db = require('../models');
const { User, Cart, CartItem, Product, Price } = db;
const { Op } = require('sequelize');

const postCartItem = async (session, productID) => {
  const transaction = await db.sequelize.transaction();
  try {
    const user = await User.findOne({ where: { login: session } });
    if (user === null) {
      await transaction.rollback();
      return { status: 401, data: {}, message: 'No active session.' };
    }

    const [cart, cartCreated] = await Cart.findOrCreate({ where: { userID: user.userID } });

    const product = await Product.findOne({
      where: { productID: productID },
      include: [{ model: Price }],
      transaction: transaction
    });

    if (product !== null && product.quantity > 0) {
      const [cartItem, cartItemCreated] = await CartItem.findOrCreate({
        where: {
          [Op.and]: [{ cartID: cart.cartID }, { productID: productID }]
        },
        defaults: {
          cartID: cart.cartID,
          productID: productID,
          quantity: product.quantity > 0 ? 1 : 0
        },
        transaction: transaction
      });

      if (!cartItemCreated) {
        if (cartItem.quantity >= product.quantity) {
          await transaction.rollback();
          return { status: 200, data: {}, message: 'Quantity limit.' };
        }

        const cartItemUpdate = await cartItem.update(
          {
            quantity:
              cartItem.quantity < product.quantity ? cartItem.quantity + 1 : cartItem.quantity
          },
          { where: { cartItemID: cartItem.cartItemID }, transaction: transaction }
        );

        const productPrice = product.promotionName
          ? product.Prices[product.Prices.length - 1].grossPrice
          : product.Prices[0].grossPrice;
        const cartUpdate = await Cart.update(
          {
            numberOfProducts: cart.numberOfProducts,
            totalQuantityofProducts: cart.totalQuantityofProducts + 1,
            totalPriceOfProducts: cart.totalPriceOfProducts + productPrice * 1
          },
          { where: { cartID: cart.cartID }, transaction: transaction }
        );
      }

      if (cartItemCreated) {
        const productPrice = product.promotionName
          ? product.Prices[product.Prices.length - 1].grossPrice
          : product.Prices[0].grossPrice;
        const cartUpdate = await Cart.update(
          {
            numberOfProducts: cart.numberOfProducts + 1,
            totalQuantityofProducts: cart.totalQuantityofProducts + 1,
            totalPriceOfProducts: cart.totalPriceOfProducts + productPrice * 1
          },
          { where: { cartID: cart.cartID }, transaction: transaction }
        );
      }
      await transaction.commit();
      return { status: 200, data: [], message: 'Product has been added to cart.' };
    } else {
      await transaction.rollback();
      return { status: 200, data: [], message: 'Quantity limit.' };
    }
  } catch (e) {
    await transaction.rollback();
    return { status: 500, data: [], message: e.message };
  }
};

const deleteCartItem = async (session, cartItemID) => {
  const transaction = await db.sequelize.transaction();
  try {
    const user = await User.findOne({ where: { login: session } });
    if (user === null) return { status: 401, data: {}, message: 'No active session.' };

    const cartItemFound = await CartItem.findOne({
      include: [
        {
          model: Product,
          attributes: ['productID', 'promotionName'],
          include: [{ model: Price, attributes: ['grossPrice'] }]
        }
      ],
      where: { cartItemID: cartItemID },
      transaction: transaction
    });

    const productPrice = cartItemFound.promotionName
      ? cartItemFound.Product.Prices[cartItemFound.Product.Prices.length - 1].grossPrice
      : cartItemFound.Product.Prices[0].grossPrice;
    const cartItemQuantity = cartItemFound.quantity;
    const cartFound = await Cart.findOne({ where: { userID: user.userID } });
    const cartUpdate = await Cart.update(
      {
        numberOfProducts: cartFound.numberOfProducts - 1,
        totalQuantityofProducts: cartFound.totalQuantityofProducts - cartItemFound.quantity,
        totalPriceOfProducts: cartFound.totalPriceOfProducts - productPrice * cartItemQuantity
      },
      { where: { userID: user.userID }, transaction: transaction }
    );
    const cartItemDeleted = await CartItem.destroy({
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

const updateCartItem = async (session, cartItemID, operationSign) => {
  const transaction = await db.sequelize.transaction();
  try {
    const user = await User.findOne({ where: { login: session } });
    if (user === null) {
      await transaction.rollback();
      return { status: 401, data: {}, message: 'No active session.' };
    }

    const cartItemData = await CartItem.findOne({
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

    const productPrice = cartItemData.Product.promotionName
      ? cartItemData.Product.Prices[cartItemData.Product.Prices.length - 1].grossPrice
      : cartItemData.Product.Prices[0].grossPrice;
    const productQuantity = cartItemData.Product.quantity;
    const cartFound = await Cart.findOne({ where: { userID: user.userID } });

    if (operationSign === '+' && productQuantity > cartItemData.quantity) {
      const cartItemUpdate = await CartItem.update(
        { quantity: cartItemData.quantity + 1 },
        { where: { cartItemID: cartItemID }, transaction: transaction }
      );

      const cartUpdate = await Cart.update(
        {
          totalQuantityofProducts: cartFound.totalQuantityofProducts + 1,
          totalPriceOfProducts: cartFound.totalPriceOfProducts + productPrice
        },
        { where: { userID: user.userID }, transaction: transaction }
      );

      await transaction.commit();
      return { status: 200, data: [], message: 'The quantity has been updated.' };
    } else if (
      operationSign === '-' &&
      cartItemData.quantity > 1 &&
      productQuantity >= cartItemData.quantity
    ) {
      const cartItemUpdate = await CartItem.update(
        { quantity: cartItemData.quantity - 1 },
        { where: { cartItemID: cartItemID }, transaction: transaction }
      );

      const cartUpdate = await Cart.update(
        {
          totalQuantityofProducts: cartFound.totalQuantityofProducts - 1,
          totalPriceOfProducts: cartFound.totalPriceOfProducts - productPrice
        },
        { where: { userID: user.userID }, transaction: transaction }
      );

      await transaction.commit();
      return { status: 200, data: [], message: 'The quantity has been updated.' };
    }
    await transaction.rollback();
    return { status: 200, data: [], message: 'Quantity limit.' };
  } catch (e) {
    await transaction.rollback();
    return { status: 500, data: [], message: e.message };
  }
};

module.exports = {
  postCartItem,
  deleteCartItem,
  updateCartItem
};
