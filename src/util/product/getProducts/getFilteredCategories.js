const db = require('../../../models');
const { Product, Manufacturer, Attribute, Price, Category, sequelize } = db;
const { Op } = require('sequelize');

module.exports = getFilteredCategories = async (productName, manufacturers, priceWhere, attrWhere) => {
  const categories = await Category.findAll({
    as: 'Category',
    attributes: [
      'categoryName',
      'categoryID',
      [sequelize.fn('COUNT', sequelize.col('Product.productID')), 'numberOfProducts']
    ],
    distinct: true,
    include: [
      {
        model: Product,
        as: 'Product',
        attributes: [],
        include: [
          {
            model: Manufacturer,
            as: 'Manufacturer',
            where: manufacturers.length !== 0 ? { [Op.or]: manufacturers } : {}
          },
          {
            model: Attribute,
            as: 'va',
            separate: Object.keys(attrWhere).length > 0 ? false : true,
            attributes: [],
            where: attrWhere
          },
          {
            model: Price,
            separate: priceWhere?.grossPrice ? false : true,
            attributes: [],
            where: priceWhere
          }
        ],
        where: { productName: { [Op.like]: `%${productName}%` } }
      }
    ],
    group: ['categoryName']
  });

  return categories;
};
