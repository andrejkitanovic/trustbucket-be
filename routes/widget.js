const express = require('express');
const widgetController = require('../controllers/widget');
const auth = require('../helpers/auth');

const router = express.Router();

router.get('/', widgetController.getWidget);
router.post('/', auth, widgetController.postWidget);

module.exports = router;
