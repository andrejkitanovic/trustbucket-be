const express = require('express');
const ratingsController = require('../controllers/rating');
const googleRatingController = require('../controllers/rating/google');
const freshaRatingController = require('../controllers/rating/fresha');
const recoseRatingController = require('../controllers/rating/recose');
const bookingRatingController = require('../controllers/rating/booking');
const trustpilotController = require('../controllers/rating/trustpilot');
const bokadirektController = require('../controllers/rating/bokadirekt');

const router = express.Router();

router.get('/', ratingsController.getRatings);
router.post('/filter', ratingsController.filterRatings);
router.delete('/', ratingsController.deleteRating);

//GOOGLE
router.get('/google/search', googleRatingController.getGoogleProfile);
router.post('/google', googleRatingController.saveGoogleRating);
router.post('/google/load', googleRatingController.loadGoogleReviews);

//TRUSTPILOT
router.get('/trustpilot/search', trustpilotController.searchTrustpilotProfile);
router.post('/trustpilot', trustpilotController.saveTrustpilotProfile);

//FRESHA
router.get('/fresha/search', freshaRatingController.searchFreshaProfile);
router.post('/fresha', freshaRatingController.saveFreshaProfile);
router.post('/fresha/load', freshaRatingController.loadFreshaReviews);

//BOOKING
router.get('/booking/search', bookingRatingController.searchBookingProfile);
router.post('/booking', bookingRatingController.saveBookingProfile);
router.post('/booking/load', bookingRatingController.loadBookingReviews);

//RECOSE
router.get('/recose/search', recoseRatingController.searchRecoseProfile);
router.post('/recose', recoseRatingController.saveRecoseProfile);
router.post('/recose/load', recoseRatingController.loadRecoseReviews);

//BOKADIREKT
router.get('/bokadirekt/search', bokadirektController.searchBokadirektProfile);
router.post('/bokadirekt', bokadirektController.saveBokadirektProfile);
router.post('/bokadirekt/load', bokadirektController.loadBokadirektReviews);

module.exports = router;
