const express = require('express');
const campaignController = require('../controllers/campaign');

const router = express.Router();

router.get('/', campaignController.getCampaigns);
router.get('/stats', campaignController.getCampaignStats);
router.post('/', campaignController.postCampaign);

module.exports = router;
