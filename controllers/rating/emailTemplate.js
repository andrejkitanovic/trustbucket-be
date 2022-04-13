const EmailTemplate = require('../models/emailTemplate');
const Company = require('../models/company');

const defaultEmailTemplates = (companyName, slug) => [
	{
		_id: `default-trustbucket-review`,
		content:
			"\n<h1>Hi {firstName}</h1>\n<p></p>\n<p>Thank you so much for choosing us!</p>\n<p></p>\n<p>We truly appreciate every customer's opinion and we want to hear all about your experience with us at {companyName}</p>\n<p></p>\n<p>{review_link: Click here to submit your review}</p>\n<p></p>\n<p>Thank you for helping us,</p>\n<p>{firstNameofUser} at {companyName}</p>\n",
		linkUrl: `https://reviews.trustbucket.io/${slug}?campaignId={campaignId}&name={firstName}&email={email}`,
		name: 'Review us on trustbucket',
		subject: `How was your experience with ${companyName}`,
		default: true,
	},
];

exports.getEmailTemplates = async (req, res, next) => {
	try {
		const { selectedCompany } = req.auth;

		const company = await Company.findById(selectedCompany);

		const emailTemplates = await EmailTemplate.find({ company: selectedCompany }).select(
			'name subject content linkUrl'
		);
		const count = await EmailTemplate.countDocuments({ company: selectedCompany });

		res.status(200).json({
			total: count,
			data: [...emailTemplates, ...defaultEmailTemplates(company.name, company.slug)],
		});
	} catch (err) {
		next(err);
	}
};

exports.postEmailTemplate = async (req, res, next) => {
	try {
		const { selectedCompany } = req.auth;

		await EmailTemplate.create({ company: selectedCompany, ...req.body });

		res.status(200).json({
			message: 'Successfully created!',
		});
	} catch (err) {
		next(err);
	}
};

exports.updateEmailTemplate = async (req, res, next) => {
	try {
		const { selectedCompany } = req.auth;

		const emailUpdated = await EmailTemplate.findOneAndUpdate(
			{
				company: selectedCompany,
				_id: req.query.id,
			},
			{
				...req.body,
			}
		);

		if (!emailUpdated) {
			const error = new Error('Not Found!');
			error.statusCode = 404;
			next(error);
		}

		res.status(200).json({
			message: 'Successfully updated!',
		});
	} catch (err) {
		next(err);
	}
};

exports.deleteEmailTemplate = async (req, res, next) => {
	try {
		const { selectedCompany } = req.auth;

		const emailDeleted = await EmailTemplate.findOneAndDelete({ company: selectedCompany, _id: req.query.id });

		if (!emailDeleted) {
			const error = new Error('Not Found!');
			error.statusCode = 404;
			next(error);
		}

		res.status(200).json({
			message: 'Successfully deleted!',
		});
	} catch (err) {
		next(err);
	}
};

exports.defaultEmailTemplates = defaultEmailTemplates;
