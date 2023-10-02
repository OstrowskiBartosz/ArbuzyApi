const db = require('../../../models');
const { Product, Manufacturer, Attribute, Price, Category, sequelize } = db;
const { Op } = require('sequelize');

module.exports = getFilteredManufacturers = async (productName, categories, priceWhere, attrWhere) => {
  const manufacturers = await Manufacturer.findAll({
    as: 'Manufacturer',
    attributes: [
      'ManufacturerName',
      'ManufacturerID',
      [sequelize.fn('COUNT', sequelize.col('Product.productID')), 'numberOfProducts']
    ],
    include: [
      {
        model: Product,
        as: 'Product',
        attributes: [],
        include: [
          {
            model: Category,
            as: 'Category',
            where: categories.length !== 0 ? { [Op.or]: categories } : {}
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
    group: ['ManufacturerName']
  });

  return manufacturers;
};
