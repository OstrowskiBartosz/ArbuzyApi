const productService = require('../services/product.service');

const getProduct = async (req, res) => {
  try {
    const { productID } = req.params;
    if (!productID) return res.status(400).send(JSON.stringify({ message: 'No req data.' }));

    const product = await productService.getProduct(productID);
    const { status, data, message } = product;
    res.status(status).send(JSON.stringify({ data: data, message: message }));
  } catch (e) {
    res.status(400).send(JSON.stringify({ data: null, message: e.message }));
  }
};

const getProducts = async (req, res) => {
  try {
    const productName = req.params.productName ?? '';

    const product = await productService.getProducts(productName, req.query, req.url);
    const { status, data, message } = product;
    res.status(status).send(JSON.stringify({ data: data, message: message }));
  } catch (e) {
    res.status(400).send(JSON.stringify({ data: null, message: e.message }));
  }
};

const getProductHints = async (req, res) => {
  try {
    const productName = req.params.productName ?? '';
    const product = await productService.getProductHints(productName);
    const { status, data, message } = product;
    res.status(status).send(JSON.stringify({ data: data, message: message }));
  } catch (e) {
    res.status(400).send(JSON.stringify({ data: null, message: e.message }));
  }
};

const getFrontPageProducts = async (req, res) => {
  try {
    const product = await productService.getFrontPageProducts();
    const { status, data, message } = product;
    res.status(status).send(JSON.stringify({ data: data, message: message }));
  } catch (e) {
    res.status(400).send(JSON.stringify({ data: data, message: e.message }));
  }
};

module.exports = {
  getProduct,
  getProducts,
  getProductHints,
  getFrontPageProducts
};
