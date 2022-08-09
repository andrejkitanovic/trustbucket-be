const express = require('express')
const widgetController = require('../controllers/widget')
const subscribedAuth = require('../helpers/auth').subscribedAuth

const router = express.Router()

router.get('/', widgetController.getWidget)
router.post('/', subscribedAuth, widgetController.postWidget)

module.exports = router
