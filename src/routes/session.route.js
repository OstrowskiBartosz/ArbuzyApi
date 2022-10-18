const express = require('express');
const sessionController = require('../controllers/session.controller');

const router = express.Router();

router.get('/', sessionController.getSession);

router.post('/', sessionController.createSession);

router.delete('/', sessionController.deleteSession);

module.exports = router;
