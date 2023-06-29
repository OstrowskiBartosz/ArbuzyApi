const db = require('../../models');
const { Invoice } = db;

module.exports = createNewInvoice = async (user, cart, paymentMethod, transaction) => {
  const invoice = await Invoice.create(
    {
      userID: user.userID,
      invoiceDate: db.sequelize.fn('NOW'),
      netPrice: cart.totalPriceOfProducts / 1.23,
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
  return invoice;
};
