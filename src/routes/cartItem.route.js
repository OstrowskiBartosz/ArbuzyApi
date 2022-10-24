const express = require('express');
const cartItemController = require('../controllers/cartItem.controller');

const router = express.Router();

router.get('/', cartItemController.postCartItem);

router.post('/', cartItemController.postCartItem);

router.put('/:cartItemID/:operationSign', cartItemController.updateCartItem);

router.delete('/:cartItemID', cartItemController.deleteCartItem);

module.exports = router;
