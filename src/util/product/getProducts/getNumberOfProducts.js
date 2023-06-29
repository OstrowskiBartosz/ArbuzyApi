const db = require('../../../models');
const { Product, Manufacturer, Attribute, Price, Category } = db;
const { Op } = require('sequelize');

module.exports = getNumberOfProducts = async (productName, categories, manufacturers, priceWhere, where, having) => {
  const getNumberOfProducts = await Product.findAll({
    as: 'Product',
    attributes: ['productID'],
    include: [
      {
        model: Attribute,
        as: 'va',
        attributes: [],
        where: where
      },
      {
        model: Category,
        as: 'Category',
        attributes: [],
        where: categories.length !== 0 ? { [Op.or]: categories } : {}
      },
      {
        model: Manufacturer,
        as: 'Manufacturer',
        attributes: [],
        where: manufacturers.length !== 0 ? { [Op.or]: manufacturers } : {}
      },
      {
        model: Price,
        attributes: ['grossPrice'],
        where: priceWhere
      }
    ],
    where: {
      productName: { [Op.like]: `%${productName}%` }
    },
    group: ['Product.productID'],
    having: having,
    subQuery: false
  });
  return getNumberOfProducts.length;
};
