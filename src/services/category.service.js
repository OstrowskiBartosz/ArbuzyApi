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
    return { status: 500, data: [], message: e.message };
  }
};

const getCategoryHints = async (categoryName) => {
  try {
    const categoryHints = await Category.findAll({
      where: { categoryName: { [Op.like]: `%${categoryName}%` } }
    });
    return { status: 200, data: categoryHints, message: 'Category retrieved.' };
  } catch (e) {
    return { status: 500, data: [], message: e.message };
  }
};

module.exports = {
  getCategories,
  getCategoryHints
};
