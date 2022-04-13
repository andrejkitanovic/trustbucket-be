const { body } = require('express-validator');
const validation = require('../helpers/validation');
const User = require('../models/user');
const Company = require('../models/company');

exports.updateEmail = [
	body('newEmail', 'email is required')
		.notEmpty()
		.isEmail()
		.normalizeEmail()
		.withMessage('email is not valid')
		.custom(async (value) => {
			const userExists = await User.findOne({ email: value });

			if (Boolean(userExists)) {
				throw new Error('email is in use');
			}

			return true;
		}),
	body('password', 'password is required')
		.not()
		.isEmpty()
		.isLength({ min: 3 })
		.withMessage('password must be longer then 3 characters'),
	validation,
];

exports.updatePassword = [
	body('newPassword', 'new password is required')
		.not()
		.isEmpty()
		.isLength({ min: 3 })
		.withMessage('new Password must be longer then 3 characters'),
	body('password', 'password is required')
		.not()
		.isEmpty()
		.isLength({ min: 3 })
		.withMessage('password must be longer then 3 characters'),
	validation,
];

exports.login = [
	body('email', 'email is required').notEmpty().isEmail().normalizeEmail().withMessage('email is not valid'),
	body('password', 'password is required')
		.not()
		.isEmpty()
		.isLength({ min: 3 })
		.withMessage('password must be longer then 3 characters'),
	validation,
];

exports.forgotPassword = [
	body('email', 'email is required').notEmpty().isEmail().normalizeEmail().withMessage('email is not valid'),
	validation,
];

exports.resetPassword = [body('id'), body('password').isLength({ min: 3 }), validation];

exports.register = [
	body('firstName', 'first name is required').notEmpty(),
	body('lastName', 'last name is required').notEmpty(),
	body('password', 'password is required')
		.notEmpty()
		.isLength({ min: 3 })
		.withMessage('password must be longer then 3 characters'),
	body('companyName', 'company name is required').notEmpty(),
	body('email', 'email is required')
		.notEmpty()
		.isEmail()
		.normalizeEmail()
		.withMessage('email is not valid')
		.custom(async (value) => {
			const userExists = await User.findOne({ email: value });

			if (Boolean(userExists)) {
				throw new Error('email is in use');
			}

			return true;
		}),
	body('phone', 'phone is required').notEmpty(),
	body('slug', 'slug is required')
		.notEmpty()
		.custom(async (value) => {
			const slugExists = await Company.findOne({ slug: value });

			if (Boolean(slugExists)) {
				throw new Error('slug is in use');
			}

			return true;
		}),
	body('websiteURL', 'website URL is required').notEmpty().isURL().withMessage('website URL is not valid'),
	validation,
];
