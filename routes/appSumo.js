const express = require('express')
const appSumoController = require('../controllers/appSumo')

const router = express.Router()

router.post('/token', appSumoController.postToken)
router.post('/notification', appSumoController.postNotification)

module.exports = router
