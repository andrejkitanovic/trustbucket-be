const { body } = require('express-validator');
const validation = require('../helpers/validation');

exports.postCampaign = [
	body('templateId', 'Template is required!').notEmpty(),
    body('recievers', 'List of validated email addresses is required!').notEmpty(),
	validation,
];