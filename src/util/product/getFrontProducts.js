const db = require('../../models');
const { Product, Manufacturer, Attribute, Price, sequelize } = db;
const { Op, DATE } = require('sequelize');

const getMostBoughtProducts = async (period) => {
  try {
    const product = await Product.findAll({
      attributes: {
        exclude: ['categoryID', 'manufacturerID', 'quantity', 'description'],
        include: [
          [
            sequelize.literal(`(
                  SELECT COUNT(*)
                  FROM invoiceItems AS invoiceItem
                  WHERE invoiceItem.productID = product.productID
              )`),
            'productsCount'
          ]
        ]
      },
      include: [
        {
          model: Price,
          attributes: {
            exclude: ['priceID', 'productID', 'netPrice', 'taxPercentage', 'fromDate', 'toDate']
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
      order: [[db.sequelize.literal('productsCount'), 'DESC']],
      limit: 6
    });
    return product;
  } catch (e) {
    return null;
  }
};

const getMostBoughtCategoryProducts = async () => {
  try {
    const product = await Product.findAll({
      attributes: {
        exclude: ['categoryID', 'manufacturerID', 'quantity', 'description'],
        include: [
          [
            sequelize.literal(`(
                  SELECT COUNT(*)
                  FROM invoiceItems AS invoiceItem
                  WHERE invoiceItem.productID = product.productID
              )`),
            'productsCount'
          ]
        ]
      },
      where: {
        categoryID: [
          sequelize.literal(`(
              SELECT c.categoryID
              FROM invoiceItems AS i
              INNER JOIN products as p ON i.productID = p.productID
              INNER JOIN categories as c ON c.categoryID = p.categoryID
              GROUP BY c.categoryID
              ORDER BY COUNT(*) DESC
              LIMIT 1
          )`),
          'category'
        ]
      },
      include: [
        {
          model: Price,
          attributes: {
            exclude: ['priceID', 'productID', 'netPrice', 'taxPercentage', 'fromDate', 'toDate']
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
      order: [[db.sequelize.literal('productsCount'), 'DESC']],
      limit: 6
    });
    return product;
  } catch (e) {
    return null;
  }
};

const getYouMayLikeThisProducts = async () => {
  try {
    const product = await Product.findAll({
      include: [
        {
          model: Price,
          attributes: { exclude: ['priceID', 'netPrice', 'taxPercentage', 'fromDate', 'toDate'] }
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
      attributes: { exclude: ['categoryID', 'manufacturerID', 'quantity', 'description'] },
      limit: 6,
      order: sequelize.random()
    });
    return product;
  } catch (e) {
    return null;
  }
};

const getDailyPromoProduct = async () => {
  try {
    const product = await Product.findOne({
      include: [
        {
          model: Price,
          attributes: ['grossPrice', 'fromDate', 'toDate'],
          where: {
            [Op.or]: [
              [
                sequelize.where(sequelize.fn('NOW'), {
                  [Op.between]: [sequelize.col('fromDate'), sequelize.col('toDate')]
                })
              ],
              { fromDate: null, toDate: null }
            ]
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
      attributes: { exclude: ['categoryID', 'manufacturerID', 'description'] },
      where: { promotionName: 'dailyPromo' }
    });
    return product;
  } catch (e) {
    return null;
  }
};

const getWeeklyPromoProduct = async () => {
  try {
    const product = await Product.findOne({
      include: [
        {
          model: Price,
          attributes: ['grossPrice', 'fromDate', 'toDate'],
          where: {
            [Op.or]: [
              [
                sequelize.where(sequelize.fn('NOW'), {
                  [Op.between]: [sequelize.col('fromDate'), sequelize.col('toDate')]
                })
              ],
              { fromDate: null, toDate: null }
            ]
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
      attributes: { exclude: ['categoryID', 'manufacturerID', 'description'] },
      where: { promotionName: 'weeklyPromo' }
    });

    return product;
  } catch (e) {
    return null;
  }
};

const getDiscountedProducts = async () => {
  try {
    const product = await Product.findAll({
      include: [
        {
          model: Price,
          attributes: ['grossPrice', 'fromDate', 'toDate'],
          where: {
            [Op.or]: [
              [
                sequelize.where(sequelize.fn('NOW'), {
                  [Op.between]: [sequelize.col('fromDate'), sequelize.col('toDate')]
                })
              ],
              { fromDate: null, toDate: null }
            ]
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
      attributes: { exclude: ['categoryID', 'manufacturerID', 'quantity', 'description'] },
      where: { promotionName: 'dailyDiscount' }
    });
    return product;
  } catch (e) {
    return null;
  }
};

module.exports = {
  getMostBoughtProducts,
  getMostBoughtCategoryProducts,
  getYouMayLikeThisProducts,
  getDiscountedProducts,
  getDailyPromoProduct,
  getWeeklyPromoProduct
};

// const productDataWeekly = {
//   Attributes: [{ value: '/images/products/13/1695259_2_i1064.jpg' }],
//   Manufacturer: { manufacturerName: 'Seagate' },
//   Prices: [{ grossPrice: 264.4, promoPrice: 235.2 }],
//   productID: 13,
//   productName: 'Barracuda Pro 1 TB 2.5" SATA III (ST1000LM049)',
//   productsCount: 0
// };
