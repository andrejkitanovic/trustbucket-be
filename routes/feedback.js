const express = require('express');
const feedbackController = require('../controllers/feedback');

const router = express.Router();

router.get('/', feedbackController.getFeedbacks);
router.post('/', feedbackController.postFeedback);

module.exports = router;
