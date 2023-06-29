const db = require('../../../models');
const { Product, Manufacturer, Attribute, Price, Category, sequelize } = db;
const { Op } = require('sequelize');

module.exports = getAttributes = async (productName, categories, manufacturers, priceWhere, where, whereLength) => {
  const attributes = await Attribute.findAll({
    attributes: ['property', 'value', [sequelize.literal('COUNT(DISTINCT Attribute.attributeID)'), 'numberOfProducts']],
    include: [
      {
        model: Product,
        as: 'Product',
        attributes: ['productID'],
        group: ['productID'],
        include: [
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
            model: Attribute,
            as: 'va',
            separate: whereLength > 0 ? false : true,
            attributes: ['attributeID'],
            where: where
          },
          {
            model: Price,
            attributes: [],
            where: priceWhere
          }
        ],
        where: { productName: { [Op.like]: `%${productName}%` } }
      }
    ],
    where: { [Op.or]: [{ type: 1 }, { type: 0 }] },
    group: ['value', 'property'],
    order: ['property'],
    subQuery: false,
    distinct: true
  });

  return attributes;
};
