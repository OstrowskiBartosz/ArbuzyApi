const db = require('../../models');
const { InvoiceItem, Product } = db;
const checkCurrentProductPrice = require('../cartItem/checkCurrentProductPrice');

module.exports = createNewInvoiceItems = async (invoiceID, cartItems, transaction) => {
  cartItems.forEach(async (item) => {
    const productPrice = checkCurrentProductPrice(item.Product);
    await InvoiceItem.create(
      {
        invoiceID: invoiceID,
        productID: item.productID,
        productName: item.Product.productName,
        netPrice: productPrice / 1.23,
        grossPrice: productPrice,
        taxPercentage: 23,
        quantity: item.quantity
      },
      { transaction: transaction }
    );

    if (item.Product.quantity - item.quantity >= 0) {
      await Product.update(
        { quantity: item.Product.quantity - item.quantity },
        { where: { productID: item.productID }, transaction: transaction }
      );
    } else {
      throw Error('limit');
    }
  });

  cartItems.forEach(async (item) => {});
};
