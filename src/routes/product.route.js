const express = require('express');
const productController = require('../controllers/product.controller.js');

const router = express.Router();

router.get('/frontPageProducts', productController.getFrontPageProducts);

router.get('/productHints/:productName?', productController.getProductHints);

router.get('/productName/:productName?', productController.getProducts);

router.get('/:productID', productController.getProduct);

module.exports = router;
