const express = require('express');
const ratingController = require('../controllers/rating');

const router = express.Router();

//SEARCH
router.get('/google/search', ratingController.getGoogleProfile);

//POST
router.post('/google', ratingController.saveGoogleRating);
router.post('/booking', ratingController.saveBookingProfile);
router.post('/fresha', ratingController.saveFreshaProfile);
router.post('/recose', ratingController.saveRecoseProfile);

module.exports = router;
