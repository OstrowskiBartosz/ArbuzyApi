const db = require('../../../models');
const { Product, Manufacturer, Attribute, Price, Category, sequelize } = db;
const { Op } = require('sequelize');

module.exports = getMinAndMaxPrice = async (productName, categories, manufacturers, where, having) => {
  const minAndMaxPrice = await Price.findAll({
    attributes: [
      [sequelize.fn('min', sequelize.col('grossPrice')), 'minPrice'],
      [sequelize.fn('max', sequelize.col('grossPrice')), 'maxPrice']
    ],
    include: [
      {
        model: Product,
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
          }
        ],
        where: {
          productName: { [Op.like]: `%${productName}%` }
        },
        group: ['Product.productID'],
        having: having,
        subQuery: false
      }
    ],
    raw: true
  });
  return [minAndMaxPrice[0].minPrice, minAndMaxPrice[0].maxPrice];
};
