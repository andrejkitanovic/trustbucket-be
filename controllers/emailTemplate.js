const EmailTemplate = require('../models/emailTemplate');

exports.getEmailTemplates = async (req, res, next) => {
	try {
		const { selectedCompany } = req.auth;

		const emailTemplates = await EmailTemplate.find({ company: selectedCompany }).select(
			'name subject content linkUrl'
		);
		const count = await EmailTemplate.countDocuments({ company: selectedCompany });

		res.status(200).json({
			total: count,
			data: emailTemplates,
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
