const express = require('express');
const campaignController = require('../controllers/campaign');

const router = express.Router();

// router.get('/', emailTemplateController.getEmailTemplates);
router.post('/', campaignController.postCampaign);
// router.put('/', emailTemplateController.updateEmailTemplate);
// router.delete('/', emailTemplateController.deleteEmailTemplate);

module.exports = router;
