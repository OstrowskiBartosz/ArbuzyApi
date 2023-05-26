const db = require('../models');
const { User, Cart, CartItem, Product, Price } = db;
const { Op } = require('sequelize');

const postCartItem = async (session, productID) => {
  const transaction = db.sequelize.transaction();

  try {
    const user = await User.findOne({ where: { login: session } });
    if (user === null) {
      await transaction.rollback();
      return { status: 401, data: {}, message: 'No active session.' };
    }

    const [cart, cartCreated] = await Cart.findOrCreate({ where: { userID: user.userID } });

    const product = await Product.findOne(
      {
        where: { productID: productID },
        include: [{ model: Price }]
      },
      { transaction }
    );

    if (product !== null && product.quantity > 0) {
      const [cartItem, cartItemCreated] = await CartItem.findOrCreate(
        {
          where: {
            [Op.and]: [{ cartID: cart.cartID }, { productID: productID }]
          },
          defaults: {
            cartID: cart.cartID,
            productID: productID,
            quantity: product.quantity > 0 ? 1 : 0
          }
        },
        { transaction }
      );

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
          { where: { cartItemID: cartItem.cartItemID }, transaction }
        );

        const cartUpdate = await Cart.update(
          {
            numberOfProducts: cart.numberOfProducts,
            totalQuantityofProducts: cart.totalQuantityofProducts + 1,
            totalPriceOfProducts: cart.totalPriceOfProducts + product.Prices[0].grossPrice * 1
          },
          { where: { cartID: cart.cartID }, transaction }
        );
      }

      if (cartItemCreated) {
        const cartUpdate = await Cart.update(
          {
            numberOfProducts: cart.numberOfProducts + 1,
            totalQuantityofProducts: cart.totalQuantityofProducts + 1,
            totalPriceOfProducts: cart.totalPriceOfProducts + product.Prices[0].grossPrice * 1
          },
          { where: { cartID: cart.cartID }, transaction }
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

    const cartItemFound = await CartItem.findOne(
      {
        include: [
          {
            model: Product,
            attributes: ['productID'],
            include: [{ model: Price, attributes: ['grossPrice'] }]
          }
        ],
        where: { cartItemID: cartItemID }
      },
      { transaction }
    );

    const productGrossPrice = cartItemFound.Product.Prices[0].grossPrice;
    const cartItemQuantity = cartItemFound.quantity;
    const cartFound = await Cart.findOne({ where: { userID: user.userID } });
    const cartUpdate = await Cart.update(
      {
        numberOfProducts: cartFound.numberOfProducts - 1,
        totalQuantityofProducts: cartFound.totalQuantityofProducts - cartItemFound.quantity,
        totalPriceOfProducts: cartFound.totalPriceOfProducts - productGrossPrice * cartItemQuantity
      },
      { where: { userID: user.userID }, transaction }
    );
    const cartItemDeleted = await CartItem.destroy(
      {
        where: { cartItemID: cartItemID }
      },
      { transaction }
    );

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

    const cartItemFind = await CartItem.findOne({
      include: [
        {
          model: Product,
          attributes: ['productID', 'quantity'],
          include: [{ model: Price, attributes: ['grossPrice'] }]
        }
      ],
      where: { cartItemID: cartItemID }
    });
    const productGrossPrice = cartItemFind.Product.Prices[0].grossPrice;
    const productQuantity = cartItemFind.Product.quantity;
    const cartFound = await Cart.findOne({ where: { userID: user.userID } });

    if (operationSign === '+' && productQuantity > cartItemFind.quantity) {
      const cartItemUpdate = await CartItem.update(
        { quantity: cartItemFind.quantity + 1 },
        { where: { cartItemID: cartItemID }, transaction }
      );

      const cartUpdate = await Cart.update(
        {
          totalQuantityofProducts: cartFound.totalQuantityofProducts + 1,
          totalPriceOfProducts: cartFound.totalPriceOfProducts + productGrossPrice
        },
        { where: { userID: user.userID }, transaction }
      );

      return { status: 200, data: [], message: 'The quantity has been updated.' };
    } else if (
      operationSign === '-' &&
      cartItemFind.quantity > 1 &&
      productQuantity >= cartItemFind.quantity
    ) {
      const cartItemUpdate = await CartItem.update(
        { quantity: cartItemFind.quantity - 1 },
        { where: { cartItemID: cartItemID }, transaction }
      );

      const cartUpdate = await Cart.update(
        {
          totalQuantityofProducts: cartFound.totalQuantityofProducts - 1,
          totalPriceOfProducts: cartFound.totalPriceOfProducts - productGrossPrice
        },
        { where: { userID: user.userID }, transaction }
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
