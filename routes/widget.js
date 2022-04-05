const express = require('express');
const widgetController = require('../controllers/widget');

const router = express.Router();

router.get('/', widgetController.getWidget);
router.post('/', widgetController.postWidget);

module.exports = router;
