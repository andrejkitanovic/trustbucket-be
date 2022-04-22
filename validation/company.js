const { body } = require('express-validator')
const validation = require('../helpers/validation')
const Company = require('../models/company')

exports.postCompany = [
    body('companyName', 'company name is required').notEmpty(),
    body('slug', 'slug is required')
        .notEmpty()
        .custom(async (value) => {
            const slugExists = await Company.findOne({ slug: value })

            if (slugExists) {
                throw new Error('slug is in use')
            }

            return true
        }),
    body('websiteURL', 'website URL is required')
        .notEmpty()
        .isURL()
        .withMessage('website URL is not valid'),
    validation,
]

exports.selectCompany = [
    body('companyId', 'company is required')
        .notEmpty()
        .custom(async (value) => {
            const companyExists = await Company.findById(value)

            if (!companyExists) {
                throw new Error("company doesn't exist")
            }

            return true
        }),
    validation,
]
