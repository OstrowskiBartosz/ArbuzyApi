const express = require('express');
const manufacturerController = require('../controllers/manufacturer.controller.js');

const router = express.Router();

router.get('/manufacturerName/:manufacturerName', manufacturerController.getManufacturers);

module.exports = router;
