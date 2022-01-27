const express = require('express');
const googleRatingController = require('../controllers/rating/google');
const freshaRatingController = require('../controllers/rating/fresha');
const recoseRatingController = require('../controllers/rating/recose');
const bookingRatingController = require('../controllers/rating/booking');

const router = express.Router();

//GOOGLE
router.get('/google/search', googleRatingController.getGoogleProfile);
router.post('/google', googleRatingController.saveGoogleRating);

//FRESHA
router.post('/fresha', freshaRatingController.saveFreshaProfile);

//BOOKING
router.post('/booking', bookingRatingController.saveBookingProfile);

//RECOSE
router.post('/recose', recoseRatingController.saveRecoseProfile);

module.exports = router;
