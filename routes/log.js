const express = require('express');
const logController = require('../controllers/log');
const auth = require('../helpers/auth');

const router = express.Router();

router.get('/', auth, logController.getLogs);
router.post('/filter', auth, logController.filterLogs);

module.exports = router;
