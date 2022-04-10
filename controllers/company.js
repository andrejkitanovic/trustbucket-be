const axios = require('axios');
const jwt = require('jsonwebtoken');
const { stripe } = require('../utils/stripe');
const User = require('../models/user');
const Company = require('../models/company');
const { getIdAndTypeFromAuth } = require('./auth');
const { isAbsoluteURL } = require('../helpers/utils');

const addAddress = async (address, selectedCompany) => {
	try {
		const company = await Company.findById(selectedCompany);

		company.address = address;
		await company.save();
		return true;
	} catch (err) {
		return false;
	}
};

exports.addAddress = addAddress;

exports.postCompany = (req, res, next) => {
	(async function () {
		try {
			const auth = getIdAndTypeFromAuth(req, res, next);
			if (!auth) {
				const error = new Error('Not Authorized!');
				error.statusCode = 401;
				next(error);
			}
			const { id } = auth;
			const { companyName, websiteURL } = req.body;

			const customer = await stripe.customers.create({});

			const profile = await User.findById(id);

			const companyObject = new Company({
				user: profile._id,
				name: companyName,
				websiteURL,
				stripeId: customer.id,
				ratings: [
					{ type: 'overall', rating: null, ratingCount: 0 },
					{ type: 'trustbucket', rating: null, ratingCount: 0 },
				],
			});

			profile.selectedCompany = companyObject._id;
			profile.companies = [...profile.companies, companyObject._id];

			const userCreated = await profile.save();
			const companyCreated = await companyObject.save();

			const token = jwt.sign(
				{ id: profile._id, type: profile.type, selectedCompany: profile.selectedCompany },
				process.env.DECODE_KEY,
				{
					// expiresIn: "1h",
				}
			);

			if (userCreated && companyCreated) {
				await profile.populate('selectedCompany');
				await profile.populate('companies', '_id name websiteURL address.name');
				res.status(200).json({
					token,
					data: profile,
					message: 'Company successfully added!',
				});
			}
		} catch (err) {
			next(err);
		}
	})();
};

exports.selectCompany = (req, res, next) => {
	(async function () {
		try {
			const auth = getIdAndTypeFromAuth(req, res, next);
			if (!auth) {
				const error = new Error('Not Authorized!');
				error.statusCode = 401;
				next(error);
			}
			const { id } = auth;
			const { companyId } = req.body;

			const profile = await User.findById(id);

			profile.selectedCompany = companyId;

			const userUpdated = await profile.save();

			const token = jwt.sign(
				{ id: profile._id, type: profile.type, selectedCompany: profile.selectedCompany },
				process.env.DECODE_KEY,
				{
					// expiresIn: "1h",
				}
			);

			if (userUpdated) {
				await profile.populate('selectedCompany');
				await profile.populate('companies', '_id name websiteURL address.name');
				res.status(200).json({
					token,
					data: profile,
					message: `Selected company is now ${profile.selectedCompany.name}!`,
				});
			}
		} catch (err) {
			next(err);
		}
	})();
};

exports.putAddress = (req, res, next) => {
	(async function () {
		try {
			const fields = ['formatted_address', 'geometry'].join('%2C');
			const textquery = req.query.q;

			let search = textquery;
			if (isAbsoluteURL(textquery) && textquery.includes('place/')) {
				search = textquery.split('place/').pop().split('/')[0];
			}
			const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?fields=${fields}&input=${search}&inputtype=textquery&key=${process.env.API_KEY_GOOGLE}`;

			const auth = getIdAndTypeFromAuth(req, res, next);
			if (!auth) {
				const error = new Error('Not Authorized!');
				error.statusCode = 401;
				next(error);
			}
			const { selectedCompany } = auth;

			const { data } = await axios.get(url);
			if (data.results.length) {
				const result = data.results[0];
				await addAddress({ name: result.formatted_address, position: result.geometry.location }, selectedCompany);
				res.json(result);
			} else {
				const error = new Error('Not Found!');
				error.statusCode = 404;
				next(error);
			}
		} catch (err) {
			next(err);
		}
	})();
};

exports.updateCompany = (req, res, next) => {
	(async function () {
		try {
			const auth = getIdAndTypeFromAuth(req, res, next);
			if (!auth) {
				const error = new Error('Not Authorized!');
				error.statusCode = 401;
				next(error);
			}
			const { id, selectedCompany } = auth;

			const companyUpdated = await Company.findOneAndUpdate(
				{ _id: selectedCompany },
				{
					...req.body,
				},
				{ new: true }
			);

			const profile = await User.findById(id);
			if (companyUpdated) {
				await profile.populate('selectedCompany');
				await profile.populate('companies', '_id name websiteURL address.name');
				res.status(200).json({
					data: profile,
					message: `Updated company!`,
				});
			}
		} catch (err) {
			next(err);
		}
	})();
};

exports.subscribeSession = (req, res, next) => {
	(async function () {
		try {
			const auth = getIdAndTypeFromAuth(req, res, next);
			if (!auth) {
				const error = new Error('Not Authorized!');
				error.statusCode = 401;
				next(error);
			}
			const { selectedCompany } = auth;

			const company = Company.findById(selectedCompany);

			const { type, plan } = req.body;

			const paymentId = {
				monthly: {
					start: 'price_1Kmo1FA7vheuEVbY2CcFOZ4d',
					pro: 'price_1Kmo1FA7vheuEVbY2CcFOZ4d',
				},
				yearly: {
					start: 'price_1Kmo1FA7vheuEVbY2CcFOZ4d',
					pro: 'price_1Kmo1FA7vheuEVbY2CcFOZ4d',
				},
			};

			const session = await stripe.checkout.sessions.create({
				billing_address_collection: 'auto',
				payment_method_types: ['card'],
				line_items: [{ price: paymentId[type][plan], quantity: 1 }],
				customer: company.stripeId,
				mode: 'subscription',
				success_url: 'https://admin.trustbucket.io/settings/plans',
				cancel_url: 'https://admin.trustbucket.io/settings/plans',
			});

			res.status(200).json({
				url: session.url,
			});
		} catch (err) {
			next(err);
		}
	})();
};
