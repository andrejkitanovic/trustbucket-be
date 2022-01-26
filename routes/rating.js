const express = require('express');
const ratingController = require('../controllers/rating');

const router = express.Router();

//SEARCH
router.get('/google/search', ratingController.getGoogleProfile);

//POST
router.post('/google', ratingController.postGoogleRating);

module.exports = router;
