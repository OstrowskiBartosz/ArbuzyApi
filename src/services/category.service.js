const db = require('../models');
const { Category } = db;
const { Op } = require('sequelize');

const getCategories = async (categoryName) => {
  try {
    const category = await Category.findAll({
      where: { categoryName: { [Op.like]: `%${categoryName}%` } }
    });
    return { status: 200, data: category, message: 'Category retrieved.' };
  } catch (e) {
    throw Error(e);
  }
};

module.exports = {
  getCategories
};
