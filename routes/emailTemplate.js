const express = require('express');
const emailTemplateController = require('../controllers/emailTemplate');

const router = express.Router();

router.get('/', emailTemplateController.getEmailTemplates);
router.post('/', emailTemplateController.postEmailTemplate);
// router.put('/', emailTemplateController.updateEmailTemplate);
// router.delete('/', emailTemplateController.deleteEmailTemplate);

module.exports = router;
