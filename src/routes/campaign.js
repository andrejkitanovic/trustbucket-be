const express = require('express')
const campaignController = require('../controllers/campaign')
const campaignValidation = require('../validation/campaign')
const auth = require('../helpers/auth').auth

const router = express.Router()

router.get('/', auth, campaignController.getCampaigns)
router.get('/recievers', auth, campaignController.getCampaignsRecievers)
router.get('/stats', auth, campaignController.getCampaignStats)
router.get(
  '/invitations-delivered',
  auth,
  campaignController.getInvitationsDelivered
)
router.post(
  '/',
  auth,
  campaignValidation.postCampaign,
  campaignController.postCampaign
)

module.exports = router
