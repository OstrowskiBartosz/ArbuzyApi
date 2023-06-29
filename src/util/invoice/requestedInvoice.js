const db = require('../../models');
const { Invoice, InvoiceItem, Product, Manufacturer, Category, Price } = db;

module.exports = requestedInvoice = async (userID, invoiceID, transaction) => {
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
    where: { userID: userID, invoiceID: invoiceID },
    transaction: transaction
  });

  return invoice;
};
