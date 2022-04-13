const express = require('express');
const campaignController = require('../controllers/campaign');
const auth = require('../helpers/auth');

const router = express.Router();

router.get('/', auth, campaignController.getCampaigns);
router.get('/stats', auth, campaignController.getCampaignStats);
router.post('/', auth, campaignController.postCampaign);

module.exports = router;
