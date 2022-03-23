const express = require('express');
const ratingsController = require('../controllers/rating');
const trustbucketController = require('../controllers/rating/trustbucket');
const googleRatingController = require('../controllers/rating/google');
const freshaRatingController = require('../controllers/rating/fresha');
const recoseRatingController = require('../controllers/rating/recose');
const bookingRatingController = require('../controllers/rating/booking');
const trustpilotController = require('../controllers/rating/trustpilot');
const bokadirektController = require('../controllers/rating/bokadirekt');
const airbnbController = require('../controllers/rating/airbnb');

const router = express.Router();

router.post('/list/:slug', ratingsController.companyRatings);

router.get('/', ratingsController.getRatings);
router.get('/stats', ratingsController.stats);
router.post('/filter', ratingsController.filterRatings);
router.delete('/', ratingsController.deleteRating);

//TRUSTBUCKET - DOING
router.get('/trustbucket/:slug', trustbucketController.getTrustbucketReviews);

//GOOGLE - DONE
router.get('/google/search', googleRatingController.getGoogleProfile);
router.post('/google', googleRatingController.saveGoogleRating);

//TRUSTPILOT - DONE
router.get('/trustpilot/search', trustpilotController.searchTrustpilotProfile);
router.post('/trustpilot', trustpilotController.saveTrustpilotProfile);

//FRESHA - DONE
router.get('/fresha/search', freshaRatingController.searchFreshaProfile);
router.post('/fresha', freshaRatingController.saveFreshaProfile);

//BOOKING - DONE
router.get('/booking/search', bookingRatingController.searchBookingProfile);
router.post('/booking', bookingRatingController.saveBookingProfile);

//RECOSE - DONE
router.get('/recose/search', recoseRatingController.searchRecoseProfile);
router.post('/recose', recoseRatingController.saveRecoseProfile);

//BOKADIREKT - DONE
router.get('/bokadirekt/search', bokadirektController.searchBokadirektProfile);
router.post('/bokadirekt', bokadirektController.saveBokadirektProfile);

// AIRBNB - ON HOLD
// router.get('/airbnb/search', airbnbController.searchAirbnbProfile);
// router.post('/airbnb', airbnbController.saveAirbnbProfile);

module.exports = router;
