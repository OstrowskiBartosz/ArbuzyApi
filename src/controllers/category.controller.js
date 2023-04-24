const categoryService = require('../services/category.service');

const getCategories = async (req, res) => {
  try {
    const { categoryName } = req.params;
    if (!categoryName) return res.status(400).send(JSON.stringify({ message: 'No req data.' }));

    const category = await categoryService.getCategories(categoryName);
    const { status, data, message } = category;
    res.status(status).send(JSON.stringify({ data: data, message: message }));
  } catch (e) {
    res.status(400).send(JSON.stringify({ status: 400, data: null, message: e.message }));
  }
};

const getCategoryHints = async (req, res) => {
  try {
    const { categoryName } = req.params;
    if (!categoryName) return res.status(400).send(JSON.stringify({ message: 'No req data.' }));

    const categoryHints = await categoryService.getCategoryHints(categoryName);
    const { status, data, message } = categoryHints;
    res.status(status).send(JSON.stringify({ data: data, message: message }));
  } catch (e) {
    res.status(400).send(JSON.stringify({ status: 400, data: null, message: e.message }));
  }
};

module.exports = {
  getCategories,
  getCategoryHints
};
