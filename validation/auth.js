const { body } = require('express-validator');
const validation = require('../helpers/validation');
const User = require('../models/user');
const Company = require('../models/company');

exports.updateEmail = [
	body('newEmail', 'Email is required!').notEmpty().isEmail().normalizeEmail().withMessage('Email is not valid!'),
	body('password', 'Password is required!')
		.not()
		.isEmpty()
		.isLength({ min: 3 })
		.withMessage('Password must be longer then 3 characters!'),
	validation,
];

exports.updatePassword = [
	body('newPassword', 'New password is required!')
		.not()
		.isEmpty()
		.isLength({ min: 3 })
		.withMessage('New Password must be longer then 3 characters!'),
	body('password', 'Password is required!')
		.not()
		.isEmpty()
		.isLength({ min: 3 })
		.withMessage('Password must be longer then 3 characters!'),
	validation,
];

exports.login = [
	body('email', 'Email is required!').notEmpty().isEmail().normalizeEmail().withMessage('Email is not valid!'),
	body('password', 'Password is required!')
		.not()
		.isEmpty()
		.isLength({ min: 3 })
		.withMessage('Password must be longer then 3 characters!'),
	validation,
];

exports.forgotPassword = [
	body('email', 'Email is required!').notEmpty().isEmail().normalizeEmail().withMessage('Email is not valid!'),
	validation,
];

exports.resetPassword = [body('id'), body('password').isLength({ min: 3 }), validation];

exports.register = [
	body('firstName', 'First Name is required!').notEmpty(),
	body('lastName', 'Last Name is required!').notEmpty(),
	body('password', 'Password is required!')
		.notEmpty()
		.isLength({ min: 3 })
		.withMessage('Password must be longer then 3 characters!'),
	body('companyName', 'Company Name is required!').notEmpty(),
	body('email', 'Email is required!')
		.notEmpty()
		.isEmail()
		.normalizeEmail()
		.withMessage('Email is not valid!')
		.custom(async (value) => {
			const userExists = await User.findOne({ email: value });

			if (Boolean(userExists)) {
				throw new Error('Email is in use!');
			}

			return true;
		}),
	body('phone', 'Phone is required!').notEmpty(),
	body('slug', 'Slug is required!')
		.notEmpty()
		.custom(async (value) => {
			const slugExists = await Company.findOne({ slug: value });

			if (Boolean(slugExists)) {
				throw new Error('Slug is in use!');
			}

			return true;
		}),

	body('websiteURL', 'Website URL is required!').notEmpty().isURL().withMessage('Website URL is not valid!'),
	validation,
];
