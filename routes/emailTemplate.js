const express = require('express')
const emailTemplateController = require('../controllers/emailTemplate')
const auth = require('../helpers/auth')

const router = express.Router()

router.get('/', auth, emailTemplateController.getEmailTemplates)
router.post('/', auth, emailTemplateController.postEmailTemplate)
router.put('/', auth, emailTemplateController.updateEmailTemplate)
router.delete('/', auth, emailTemplateController.deleteEmailTemplate)

module.exports = router
