const { body } = require('express-validator')
const { defaultEmailTemplates } = require('../controllers/emailTemplate')
const validation = require('../helpers/validation')
const Template = require('../models/emailTemplate')

exports.postCampaign = [
  body('templateId', 'template is required')
    .notEmpty()
    .custom(async (value) => {
      let templateExists = false

      if (value.includes('default')) {
        templateExists = defaultEmailTemplates('', '').find(
          (template) => template._id === value
        )
      } else {
        templateExists = await Template.findById(value)
      }

      if (!templateExists) {
        throw new Error("template doesn't exist")
      }

      return true
    }),
  body('recievers', 'list of validated email addresses is required').notEmpty(),
  validation,
]
