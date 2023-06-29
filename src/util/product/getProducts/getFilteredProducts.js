const db = require('../../../models');
const { Product, Manufacturer, Attribute, Price, Category, sequelize } = db;
const { Op } = require('sequelize');

module.exports = getFilteredProducts = async (
  productName,
  categories,
  manufacturers,
  priceWhere,
  where,
  whereLength,
  having,
  productLimit,
  pageOffset
) => {
  const products = await Product.findAll({
    as: 'Product',
    attributes: { exclude: ['description', 'categoryID', 'manufacturerID'] },
    separate: true,
    include: [
      {
        model: Attribute,
        as: 'va',
        separate: whereLength > 0 ? false : true,
        attributes: ['attributeID'],
        where: where
      },
      {
        model: Attribute,
        as: 'Attributes',
        attributes: {
          exclude: ['productID', 'attributeID', 'type']
        },
        separate: true,
        where: { [Op.or]: [{ type: 1 }, { type: 2 }] }
      },
      {
        model: Category,
        as: 'Category',
        where: categories.length !== 0 ? { [Op.or]: categories } : {}
      },
      {
        model: Manufacturer,
        as: 'Manufacturer',
        where: manufacturers.length !== 0 ? { [Op.or]: manufacturers } : {}
      },
      {
        model: Price,
        attributes: { exclude: ['priceID', 'productID', 'taxPercentage', 'fromDate', 'toDate'] },
        where: priceWhere
      }
    ],
    where: { productName: { [Op.like]: `%${productName}%` } },
    group: ['Product.productID'],
    having: having,
    order: [sortBy],
    limit: [productLimit],
    offset: pageOffset > getNumberOfProducts.length ? 0 : pageOffset,
    subQuery: true
  });

  return products;
};
