const express = require('express');
const ratingsController = require('../controllers/rating');
const trustbucketController = require('../controllers/rating/trustbucket');
const googleRatingController = require('../controllers/rating/google');
const freshaRatingController = require('../controllers/rating/fresha');
const recoseRatingController = require('../controllers/rating/recose');
const bookingRatingController = require('../controllers/rating/booking');
const trustpilotController = require('../controllers/rating/trustpilot');
const bokadirektController = require('../controllers/rating/bokadirekt');
const hittaController = require('../controllers/rating/hitta');

const auth = require('../helpers/auth');
// const airbnbController = require('../controllers/rating/airbnb');

const router = express.Router();

router.get('/', auth, ratingsController.getRatings);
router.get('/stats', auth, ratingsController.stats);
router.post('/filter', auth, ratingsController.filterRatings);
router.delete('/', auth, ratingsController.deleteRating);

// GUEST GET COMPANY RATINGS
router.post('/list/:slug', ratingsController.companyRatings);

// TRUSTBUCKET - DOING
router.get('/trustbucket/:slug', trustbucketController.getTrustbucketReviews);
router.post('/trustbucket', trustbucketController.postTrustbucketReviews);
router.post('/trustbucket/confirm/:id', trustbucketController.confirmTrustbucketReview);
router.post('/trustbucket/reply', auth, trustbucketController.postTrustbucketReply);
router.delete('/trustbucket/reply/:id', auth, trustbucketController.deleteTrustbucketReply);

// GOOGLE - DONE
router.post('/google/search', auth, googleRatingController.getGoogleProfile);
router.post('/google', auth, googleRatingController.saveGoogleRating);

// TRUSTPILOT - DONE
router.post('/trustpilot/search', auth, trustpilotController.searchTrustpilotProfile);
router.post('/trustpilot', auth, trustpilotController.saveTrustpilotProfile);

// FRESHA - DONE
router.post('/fresha/search', auth, freshaRatingController.searchFreshaProfile);
router.post('/fresha', auth, freshaRatingController.saveFreshaProfile);

// BOOKING - DONE
router.post('/booking/search', auth, bookingRatingController.searchBookingProfile);
router.post('/booking', auth, bookingRatingController.saveBookingProfile);

// RECOSE - DONE
router.post('/recose/search', auth, recoseRatingController.searchRecoseProfile);
router.post('/recose', auth, recoseRatingController.saveRecoseProfile);

// BOKADIREKT - DONE
router.post('/bokadirekt/search', auth, bokadirektController.searchBokadirektProfile);
router.post('/bokadirekt', auth, bokadirektController.saveBokadirektProfile);

// HITTA - DOING
router.post('/hitta/search', hittaController.searchHittaProfile);
router.post('/hitta', hittaController.saveHittaProfile);

// AIRBNB - ON HOLD
// router.get('/airbnb/search', airbnbController.searchAirbnbProfile);
// router.post('/airbnb', airbnbController.saveAirbnbProfile);

module.exports = router;
