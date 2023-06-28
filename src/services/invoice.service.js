const db = require('../models');
const { Invoice, InvoiceItem, User, Product, Manufacturer, Category, Price, Cart, CartItem } = db;
const checkUserLogged = require('../util/checkUserLogged');

const getInvoices = async (userSession) => {
  try {
    const transaction = await db.sequelize.transaction();
    const user = await checkUserLogged(userSession, transaction);

    const invoice = await Invoice.findAll({
      attributes: { exclude: ['userID', 'taxPercentage'] },
      where: { userID: user.userID }
    });
    return { status: 200, data: invoice, message: 'Success.' };
  } catch (e) {
    return { status: 500, data: [], message: e.message };
  }
};

const getInvoice = async (userSession, invoiceID) => {
  try {
    const transaction = await db.sequelize.transaction();
    const user = await checkUserLogged(userSession, transaction);

    const invoice = await Invoice.findOne({
      attributes: { exclude: ['userID', 'taxPercentage'] },
      include: [
        {
          model: InvoiceItem,
          include: [
            {
              model: Product,
              include: [
                {
                  model: Price,
                  attributes: {
                    exclude: ['productID', 'priceID', 'taxPercentage', 'fromDate', 'toDate']
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
                  model: Category,
                  as: 'Category',
                  attributes: {
                    exclude: ['categoryID']
                  }
                }
              ],
              attributes: {
                exclude: ['description', 'manufacturerID', 'quantity']
              }
            }
          ]
        }
      ],
      where: { userID: user.userID, invoiceID: invoiceID },
      transaction: transaction
    });
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
      const updateInvoice = await Invoice.update(
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
    const cartItem = await CartItem.findAll({
      include: [
        {
          model: Product,
          include: [{ model: Price }]
        }
      ],
      where: { cartID: cart.cartID },
      transaction: transaction
    });

    const invoice = await Invoice.create(
      {
        userID: user.userID,
        invoiceDate: db.sequelize.fn('NOW'),
        netPrice: cart.totalPriceOfProducts * 0.77,
        grossPrice: cart.totalPriceOfProducts,
        taxPercentage: 23,
        paymentMethod: paymentMethod,
        status: 'Pending',
        name: `${user.firstName} ${user.lastName}`,
        cityName: user.cityName,
        streetName: user.streetName,
        ZIPCode: user.ZIPCode,
        VATNumber: user.VATNumber ? user.VATNumber : null,
        companyName: user.companyName ? user.companyName : null
      },
      { transaction: transaction }
    );

    cartItem.forEach(async (item) => {
      await InvoiceItem.create(
        {
          invoiceID: invoice.invoiceID,
          productID: item.productID,
          productName: item.Product.productName,
          netPrice: item.Product.Prices[0].netPrice,
          grossPrice: item.Product.Prices[0].grossPrice,
          taxPercentage: item.Product.Prices[0].taxPercentage,
          quantity: item.quantity
        },
        { transaction: transaction }
      );
    });

    cartItem.forEach(async (item) => {
      if (item.Product.quantity - item.quantity >= 0) {
        await Product.update(
          { quantity: item.Product.quantity - item.quantity },
          { where: { productID: item.productID }, transaction: transaction }
        );
      } else {
        throw Error('limit');
      }
    });
    const cartItemDelete = await CartItem.destroy({
      where: { cartID: cart.cartID },
      transaction: transaction
    });
    const cartDelete = await Cart.destroy({
      where: { userID: user.userID },
      transaction: transaction
    });

    await transaction.commit();
    return {
      status: 200,
      data: { invoiceID: invoice.invoiceID },
      message: 'Items have been bought.'
    };
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
