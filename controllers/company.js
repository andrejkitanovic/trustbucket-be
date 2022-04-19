const axios = require('axios');
const jwt = require('jsonwebtoken');
const stripe = require('../utils/stripe');
const User = require('../models/user');
const Company = require('../models/company');
const { isAbsoluteURL } = require('../helpers/utils');

const products = {
	monthly: {
		start: 'price_1Kmo1FA7vheuEVbY2CcFOZ4d',
		pro: 'price_1KoRDmA7vheuEVbYRvLMht7n',
	},
	yearly: {
		start: 'price_1KoRBdA7vheuEVbYSfTdoQMK',
		pro: 'price_1KoRDmA7vheuEVbY8p5Ax9hF',
	},
};

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

exports.filterCompanies = async (req, res, next) => {
	try {
		const { pageNumber, pageSize, sortField, sortOrder } = req.body.queryParams;
		const { selectedCompany } = req.auth;

		const companies = await Company.find({ _id: { $ne: selectedCompany } })
			.sort([[sortField, sortOrder === 'asc' ? 1 : -1]])
			.skip(Number((pageNumber - 1) * pageSize))
			.limit(Number(pageSize))
			.populate('user');
		const count = await Company.countDocuments({ _id: { $ne: selectedCompany } });

		res.status(200).json({
			data: companies,
			total: count,
		});
	} catch (err) {
		next(err);
	}
};

exports.getInvoices = async (req, res, next) => {
	try {
		const { selectedCompany } = req.auth;

		const company = await Company.findById(selectedCompany);

		const invoices = await stripe.invoices.list({
			customer: company.stripeId,
		});

		const invoicesObject = invoices.data.map((invoice) => ({
			amount: invoice.total / 100,
			created: invoice.created * 1000,
			currency: invoice.currency,
			pdf: invoice.invoice_pdf,
			item: invoice.lines.data[0].description,
		}));

		res.status(200).json(invoicesObject);
	} catch (err) {
		next(err);
	}
};

exports.postCompany = async (req, res, next) => {
	try {
		const { id } = req.auth;

		const { companyName, websiteURL, slug } = req.body;

		const customer = await stripe.customers.create({
			name: companyName,
		});

		const profile = await User.findById(id);

		const companyObject = new Company({
			user: profile._id,
			name: companyName,
			websiteURL,
			slug,
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
};

exports.selectCompany = async (req, res, next) => {
	try {
		const { id } = req.auth;
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
};

exports.putAddress = async (req, res, next) => {
	try {
		const fields = ['formatted_address', 'geometry'].join('%2C');
		const textquery = req.query.q;

		let search = textquery;
		if (isAbsoluteURL(textquery) && textquery.includes('place/')) {
			search = textquery.split('place/').pop().split('/')[0];
		}
		const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?fields=${fields}&input=${search}&inputtype=textquery&key=${process.env.API_KEY_GOOGLE}`;

		const { selectedCompany } = req.auth;

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
};

exports.updateCompany = async (req, res, next) => {
	try {
		const { id, selectedCompany } = req.auth;

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
};

exports.updateCompanyBillingInfo = async (req, res, next) => {
	try {
		const { id, selectedCompany } = req.auth;
		const { address, email } = req.body;

		const customer = await Company.findById(selectedCompany).select('stripeId');

		const companyUpdated = await Company.findOneAndUpdate(
			{ _id: selectedCompany },
			{
				'billingInfo.address': address,
				'billingInfo.email': email,
			},
			{ new: true }
		);

		await stripe.customers.update(customer.stripeId, {
			email,
		});

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
};

exports.subscribeSession = async (req, res, next) => {
	try {
		const { selectedCompany } = req.auth;

		const company = await Company.findById(selectedCompany);

		const { type, plan } = req.body;

		const session = await stripe.checkout.sessions.create({
			billing_address_collection: 'auto',
			payment_method_types: ['card'],
			line_items: [{ price: products[type][plan], quantity: 1 }],
			customer: company.stripeId,
			customer_update: {
				name: 'auto',
				address: 'auto',
			},
			tax_id_collection: {
				enabled: true,
			},
			mode: 'subscription',
			success_url: 'https://admin.trustbucket.io/settings/plans',
			cancel_url: 'https://admin.trustbucket.io/settings/plans',
			automatic_tax: {
				enabled: true,
			},
		});

		res.status(200).json({
			url: session.url,
		});
	} catch (err) {
		next(err);
	}
};

exports.updatePaymentInfoSession = async (req, res, next) => {
	try {
		const { selectedCompany } = req.auth;

		const company = await Company.findById(selectedCompany);

		const session = await stripe.checkout.sessions.create({
			billing_address_collection: 'auto',
			payment_method_types: ['card'],
			customer: company.stripeId,
			customer_update: {
				name: 'auto',
				address: 'auto',
			},
			mode: 'setup',
			success_url: 'https://admin.trustbucket.io/settings/billing',
			cancel_url: 'https://admin.trustbucket.io/settings/billing',
		});

		res.status(200).json({
			url: session.url,
		});
	} catch (err) {
		next(err);
	}
};

exports.changePlanSession = async (req, res, next) => {
	try {
		const { selectedCompany } = req.auth;

		const company = await Company.findById(selectedCompany);

		const { type, plan } = req.body;

		const subscriptionId = company.subscription.id;

		const subscription = await stripe.subscriptions.retrieve(subscriptionId);

		const subscriptionUpdate = await stripe.subscriptions.update(subscriptionId, {
			cancel_at_period_end: false,
			proration_behavior: 'create_prorations',
			items: [
				{
					id: subscription.items.data[0].id,
					price: products[type][plan],
				},
			],
		});
		
		console.log(subscriptionUpdate);

		res.status(200).json({
			message: 'Updated subscription',
		});
	} catch (err) {
		next(err);
	}
};

exports.products = products;
