const express = require('express');
const cartController = require('../controllers/cart.controller');

const router = express.Router();

router.get('/getItemsNumber', cartController.getCartItemsNumber);

router.get('/', cartController.getCart);

router.delete('/:cartID', cartController.deleteCart);

module.exports = router;
