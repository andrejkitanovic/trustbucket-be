const express = require('express')
const feedbackController = require('../controllers/feedback')
const auth = require('../helpers/auth')

const router = express.Router()

router.get('/', auth, feedbackController.getFeedbacks)
router.post('/', auth, feedbackController.postFeedback)

module.exports = router
