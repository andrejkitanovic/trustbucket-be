const { query } = require('express-validator');
const validation = require('../helpers/validation');
// const Company = require('../models/company');

exports.getWidget = [
	query('id', 'widget id is required').notEmpty(),
	validation,
];

// exports.selectCompany = [
// 	body('companyId', 'company is required')
// 		.notEmpty()
// 		.custom(async (value) => {
// 			const companyExists = await Company.findById(value);

// 			if (!Boolean(companyExists)) {
// 				throw new Error("company doesn't exist");
// 			}

// 			return true;
// 		}),
// 	validation,
// ];
