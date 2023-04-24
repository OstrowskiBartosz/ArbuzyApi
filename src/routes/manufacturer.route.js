const express = require('express');
const manufacturerController = require('../controllers/manufacturer.controller.js');

const router = express.Router();

router.get('/manufacturerHints/:manufacturerName', manufacturerController.getManufacturers);

router.get('/productHints/:manufacturerName?', manufacturerController.getManufacturerHints);

module.exports = router;
