const productService = require('../services/product.service');

const getProduct = async (req, res) => {
  try {
    const { productID } = req.params;
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

const getMostBoughtProducts = async (req, res) => {
  try {
    const product = await productService.getMostBoughtProducts();
    const { status, data, message } = product;
    res.status(status).send(JSON.stringify({ data: data, message: message }));
  } catch (e) {
    res.status(400).send(JSON.stringify({ data: null, message: e.message }));
  }
};

const getMostBoughtCategoryProducts = async (req, res) => {
  try {
    const product = await productService.getMostBoughtCategoryProducts();
    const { status, data, message } = product;
    res.status(status).send(JSON.stringify({ data: data, message: message }));
  } catch (e) {
    res.status(400).send(JSON.stringify({ data: null, message: e.message }));
  }
};

const getYouMayLikeThisProducts = async (req, res) => {
  try {
    const product = await productService.getYouMayLikeThisProducts();
    const { status, data, message } = product;
    res.status(status).send(JSON.stringify({ data: data, message: message }));
  } catch (e) {
    res.status(400).send(JSON.stringify({ data: null, message: e.message }));
  }
};

module.exports = {
  getProduct,
  getProducts,
  getMostBoughtProducts,
  getMostBoughtCategoryProducts,
  getYouMayLikeThisProducts
};
