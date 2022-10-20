const express = require('express');
const categoryController = require('../controllers/category.controller.js');

const router = express.Router();

router.get('/categoryName/:categoryName', categoryController.getCategories);

module.exports = router;
