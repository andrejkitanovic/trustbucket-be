const express = require('express');
const googleRatingController = require('../controllers/rating/google');
const freshaRatingController = require('../controllers/rating/fresha');
const recoseRatingController = require('../controllers/rating/recose');
const bookingRatingController = require('../controllers/rating/booking');
const trustpilotController = require('../controllers/rating/trustpilot');
const bokadirektController = require('../controllers/rating/bokadirekt');

const router = express.Router();

//GOOGLE
router.get('/google/search', googleRatingController.getGoogleProfile);
router.post('/google', googleRatingController.saveGoogleRating);

//TRUSTPILOT
router.get('/trustpilot/search', trustpilotController.searchTrustpilotProfile);
router.post('/trustpilot', trustpilotController.saveTrustpilotProfile)

//FRESHA
router.get('/fresha/search', freshaRatingController.searchFreshaProfile);
router.post('/fresha', freshaRatingController.saveFreshaProfile);

//BOOKING
router.get('/booking/search', bookingRatingController.searchBookingProfile);
router.post('/booking', bookingRatingController.saveBookingProfile);

//RECOSE
router.get('/recose/search', recoseRatingController.searchRecoseProfile);
router.post('/recose', recoseRatingController.saveRecoseProfile);
router.post('/recose/download', recoseRatingController.downloadRecoseReviews);

//BOKADIREKT
router.get('/bokadirekt/search', bokadirektController.searchBokadirektProfile);
router.post('/bokadirekt', bokadirektController.saveBokadirektProfile);
router.post('/bokadirekt/download', bokadirektController.downloadBokadirektReviews);

module.exports = router;
