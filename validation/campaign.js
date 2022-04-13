const { body } = require('express-validator');
const validation = require('../helpers/validation');
const Template = require('../models/emailTemplate');

exports.postCampaign = [
	body('templateId', 'Template is required!').notEmpty(),
	// .custom(async (value) => {
	// 	const templateExists = await Template.findById(value);

	// 	if (!Boolean(templateExists)) {
	// 		throw new Error("Template doesn't exist");
	// 	}

	// 	return true;
	// }),
	body('recievers', 'List of validated email addresses is required!').notEmpty(),
	validation,
];
