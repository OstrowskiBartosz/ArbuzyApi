const express = require('express');
const productController = require('../controllers/product.controller.js');

const router = express.Router();

router.get('/mostBoughtProducts', productController.getMostBoughtProducts);

router.get('/mostBoughtCategoryProducts', productController.getMostBoughtCategoryProducts);

router.get('/youMayLikeThisProducts', productController.getYouMayLikeThisProducts);

router.get('/productHints/:productName?', productController.getProductHints);

router.get('/productName/:productName?', productController.getProducts);

router.get('/:productID', productController.getProduct);

module.exports = router;
