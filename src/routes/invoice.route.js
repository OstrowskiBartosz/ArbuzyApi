const express = require('express');
const invoiceController = require('../controllers/invoice.controller');

const router = express.Router();

router.get('/:invoiceID', invoiceController.getInvoice);

router.put('/:invoiceID', invoiceController.updateInvoice);

router.get('/', invoiceController.getInvoices);

router.post('/', invoiceController.postInvoice);

module.exports = router;
