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
router.get('/stats', ratingsController.stats);
router.post('/filter', ratingsController.filterRatings);
router.delete('/', ratingsController.deleteRating);

//GOOGLE - DONE
router.get('/google/search', googleRatingController.getGoogleProfile);
router.post('/google', googleRatingController.saveGoogleRating);

//TRUSTPILOT - DONE
router.get('/trustpilot/search', trustpilotController.searchTrustpilotProfile);
router.post('/trustpilot', trustpilotController.saveTrustpilotProfile);

//FRESHA - DONE
router.get('/fresha/search', freshaRatingController.searchFreshaProfile);
router.post('/fresha', freshaRatingController.saveFreshaProfile);

//BOOKING
router.get('/booking/search', bookingRatingController.searchBookingProfile);
router.post('/booking', bookingRatingController.saveBookingProfile);

//RECOSE - DONE
router.get('/recose/search', recoseRatingController.searchRecoseProfile);
router.post('/recose', recoseRatingController.saveRecoseProfile);

//BOKADIREKT - DONE
router.get('/bokadirekt/search', bokadirektController.searchBokadirektProfile);
router.post('/bokadirekt', bokadirektController.saveBokadirektProfile);

module.exports = router;
