const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { stripe } = require('../utils/stripe');
const User = require('../models/user');
const Company = require('../models/company');
const InvitationSettings = require('../models/invitationSettings');
const { confirmEmail, forgotPassword } = require('../utils/mailer');
const dayjs = require('dayjs');

const getIdAndTypeFromAuth = (req, res, next) => {
	if (req.headers && req.headers.authorization) {
		let authorization = req.headers.authorization.split(' ')[1];
		let decoded = jwt.verify(authorization, process.env.DECODE_KEY);
		return {
			id: decoded.id,
			type: decoded.type,
			selectedCompany: decoded.selectedCompany,
		};
	}
	return null;
};

exports.getCurrentUser = async (req, res, next) => {
	const auth = getIdAndTypeFromAuth(req, res, next);
	if (!auth) {
		const error = new Error('Not Authorized!');
		error.statusCode = 401;
		next(error);
	}

	const { id } = auth;

	try {
		const currentUser = await User.findById(id);
		await currentUser.populate('selectedCompany', '_id name image websiteURL ratings');
		await currentUser.populate('companies', '_id name');
		res.status(200).json({
			data: currentUser,
		});
	} catch (err) {
		next(err);
	}
};

exports.updateEmail = async (req, res, next) => {
	try {
		const auth = getIdAndTypeFromAuth(req, res, next);
		if (!auth) {
			const error = new Error('Not Authorized!');
			error.statusCode = 401;
			next(error);
		}
		const { id } = auth;

		const { newEmail, password } = req.body;
		const loginUser = await User.findById(id);

		if (!loginUser) {
			const error = new Error('User not found!');
			error.statusCode = 404;
			return next(error);
		}

		const validPassword = await bcrypt.compare(password, loginUser.password);

		if (!validPassword) {
			const error = new Error('Password is not valid!');
			error.statusCode = 401;
			return next(error);
		}

		loginUser.email = newEmail;
		const savedUser = await loginUser.save();

		await savedUser.populate('selectedCompany', '_id name websiteURL ratings');
		await savedUser.populate('companies', '_id name');
		res.status(200).json({
			data: savedUser,
			message: 'Successful changed email!',
		});
	} catch (err) {
		next(err);
	}
};

exports.updatePassword = async (req, res, next) => {
	try {
		const auth = getIdAndTypeFromAuth(req, res, next);
		if (!auth) {
			const error = new Error('Not Authorized!');
			error.statusCode = 401;
			next(error);
		}
		const { id } = auth;

		const { newPassword, password } = req.body;
		const loginUser = await User.findById(id);

		if (!loginUser) {
			const error = new Error('User not found!');
			error.statusCode = 404;
			return next(error);
		}

		const validPassword = await bcrypt.compare(password, loginUser.password);

		if (!validPassword) {
			const error = new Error('Password is not valid!');
			error.statusCode = 401;
			return next(error);
		}

		const hashedPassword = await bcrypt.hash(newPassword, 12);

		loginUser.password = hashedPassword;
		const savedUser = await loginUser.save();

		await savedUser.populate('selectedCompany', '_id name image websiteURL ratings');
		await savedUser.populate('companies', '_id name');
		res.status(200).json({
			data: savedUser,
			message: 'Successful changed password!',
		});
	} catch (err) {
		next(err);
	}
};

exports.login = async (req, res, next) => {
	try {
		// const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;

		const { email, password } = req.body;
		const loginUser = await User.findOne({ email });

		if (!loginUser) {
			const error = new Error('User not found!');
			error.statusCode = 404;
			return next(error);
		}

		const validPassword = await bcrypt.compare(password, loginUser.password);

		if (!validPassword) {
			const error = new Error('Password is not valid!');
			error.statusCode = 401;
			return next(error);
		}

		if (!loginUser.confirmed) {
			const error = new Error('User is not confirmed!');
			error.statusCode = 401;
			return next(error);
		}

		const token = jwt.sign(
			{ id: loginUser._id, type: loginUser.type, selectedCompany: loginUser.selectedCompany },
			process.env.DECODE_KEY,
			{
				// expiresIn: "1h",
			}
		);

		await loginUser.populate('selectedCompany', '_id name websiteURL ratings');
		await loginUser.populate('companies', '_id name');
		res.status(200).json({
			token,
			data: loginUser,
			message: 'Successful login!',
		});
	} catch (err) {
		next(err);
	}
};

exports.confirmEmail = async (req, res, next) => {
	try {
		const { id } = req.body;
		const user = await User.findById(id);

		user.confirmed = true;
		await user.save();

		res.status(200).json({
			message: 'Successful confirmed email!',
		});
	} catch (err) {
		next(err);
	}
};

exports.forgotPassword = async (req, res, next) => {
	try {
		const { email } = req.body;
		const user = await User.findOne({ email });

		if (!user) {
			const error = new Error('User not found!');
			error.statusCode = 404;
			return next(error);
		}

		await forgotPassword({ id: user._id, email: user.email, firstName: user.firstName, lastName: user.lastName });

		res.status(200).json({
			message: 'Email for reset password sent!',
		});
	} catch (err) {
		next(err);
	}
};

exports.resetPassword = async (req, res, next) => {
	try {
		const { id, password } = req.body;
		const user = await User.findById(id);

		if (!user) {
			const error = new Error('User not found!');
			error.statusCode = 404;
			return next(error);
		}

		const hashedPassword = await bcrypt.hash(password, 12);

		user.password = hashedPassword;
		await user.save();

		res.status(200).json({
			message: 'Successfully reseted password!',
		});
	} catch (err) {
		next(err);
	}
};

exports.googleLogin = async (req, res, next) => {
	try {
		const { email } = req.body;
		const loginUser = await User.findOne({ email });

		if (!loginUser) {
			const error = new Error('User not found!');
			error.statusCode = 404;
			return next(error);
		}

		if (!loginUser.confirmed) {
			loginUser.confirmed = true;
			await loginUser.save();
		}

		const token = jwt.sign(
			{ id: loginUser._id, type: loginUser.type, selectedCompany: loginUser.selectedCompany },
			process.env.DECODE_KEY,
			{
				// expiresIn: "1h",
			}
		);

		await loginUser.populate('selectedCompany', '_id name websiteURL ratings');
		await loginUser.populate('companies', '_id name');
		res.status(200).json({
			token,
			data: loginUser,
			message: 'Successful login!',
		});
	} catch (err) {
		next(err);
	}
};

exports.register = async (req, res, next) => {
	try {
		const { password, firstName, lastName, phone, email, companyName, websiteURL, slug } = req.body;
		const hashedPassword = await bcrypt.hash(password, 12);

		const userObject = new User({
			firstName,
			lastName,
			phone,
			email,
			password: hashedPassword,
		});
		const customer = await stripe.customers.create({
			name: companyName,
		});
		const companyObject = new Company({
			user: userObject._id,
			name: companyName,
			stripeId: customer.id,
			slug,
			websiteURL,
			ratings: [
				{ type: 'overall', rating: null, ratingCount: 0 },
				{ type: 'trustbucket', rating: null, ratingCount: 0 },
			],
			subscription: {
				plan: 'trial',
				ends: dayjs().add(7, 'day'),
			},
		});
		const invitationSettingsObject = new InvitationSettings({
			company: companyObject._id,
			senderName: companyName,
			replyTo: email,
		});

		userObject.selectedCompany = companyObject._id;
		userObject.companies = [companyObject._id];

		const userCreated = await userObject.save();
		const companyCreated = await companyObject.save();
		await invitationSettingsObject.save();

		await confirmEmail({ id: userObject._id, firstName, lastName, email });

		if (userCreated && companyCreated) {
			await userObject.populate('selectedCompany', '_id name image websiteURL ratings');
			await userObject.populate('companies', '_id name');
			res.status(200).json({
				data: userObject,
				message: 'Please confirm your email address!',
			});
		}
	} catch (err) {
		next(err);
	}
};

// exports.googleRegister = (req, res, next) => {};

exports.getIdAndTypeFromAuth = getIdAndTypeFromAuth;
