const db = require('../models');
const { Invoice, Product, Price, Cart, CartItem } = db;
const requestedInvoice = require('../util/invoice/requestedInvoice');
const checkUserLogged = require('../util/user/checkUserLogged');
const createNewInvoice = require('../util/invoice/createNewInvoice');
const createNewInvoiceItems = require('../util/invoice/createNewInvoiceItems');
const resetCart = require('../util/invoice/resetCart');

const getInvoices = async (userSession) => {
  try {
    const transaction = await db.sequelize.transaction();
    const user = await checkUserLogged(userSession, transaction);

    const invoice = await Invoice.findAll({
      attributes: { exclude: ['userID', 'taxPercentage'] },
      where: { userID: user.userID },
      transaction: transaction
    });
    transaction.commit();
    return { status: 200, data: invoice, message: 'Success.' };
  } catch (e) {
    transaction.rollback();
    return { status: 500, data: [], message: e.message };
  }
};

const getInvoice = async (userSession, invoiceID) => {
  try {
    const transaction = await db.sequelize.transaction();
    const user = await checkUserLogged(userSession, transaction);

    const invoice = await requestedInvoice(user.userID, invoiceID, transaction);
    if (invoice) {
      transaction.commit();
      return { status: 200, data: invoice, message: 'Success.' };
    } else {
      transaction.rollback();
      return { status: 400, data: invoice, message: "Didn't find such invoice." };
    }
  } catch (e) {
    transaction.rollback();
    return { status: 500, data: [], message: e.message };
  }
};

const updateInvoice = async (userSession, invoiceID) => {
  try {
    const transaction = await db.sequelize.transaction();
    const user = await checkUserLogged(userSession, transaction);

    const invoice = await Invoice.findOne({
      attributes: { exclude: ['userID', 'taxPercentage'] },
      where: { userID: user.userID, invoiceID: invoiceID },
      transaction: transaction
    });

    if (invoice.status === 'Pending') {
      await Invoice.update(
        { status: 'Cancelled' },
        { where: { userID: user.userID, invoiceID: invoiceID }, transaction: transaction }
      );
      transaction.commit();
      return { status: 200, data: null, message: 'Success.' };
    } else {
      transaction.rollback();
      return { status: 400, data: null, message: "Can't cancel this order." };
    }
  } catch (e) {
    transaction.rollback();
    return { status: 500, data: null, message: e.message };
  }
};

const postInvoice = async (userSession, paymentMethod) => {
  try {
    const transaction = await db.sequelize.transaction();
    const user = await checkUserLogged(userSession, transaction);

    const cart = await Cart.findOne({ where: { userID: user.userID } });
    const cartItems = await CartItem.findAll({
      include: [
        {
          model: Product,
          include: [{ model: Price }]
        }
      ],
      where: { cartID: cart.cartID },
      transaction: transaction
    });

    const newInvoice = await createNewInvoice(user, cart, paymentMethod, transaction);
    await createNewInvoiceItems(newInvoice.invoiceID, cartItems, transaction);
    await resetCart(cart.cartID, user.userID, transaction);

    await transaction.commit();
    return { status: 200, data: { invoiceID: newInvoice.invoiceID }, message: 'Items have been bought.' };
  } catch (e) {
    await transaction.rollback();
    return { status: 500, data: null, message: e.message };
  }
};

module.exports = {
  updateInvoice,
  getInvoices,
  getInvoice,
  postInvoice
};
