const EmailTemplate = require('../models/emailTemplate');
const { getIdAndTypeFromAuth } = require('./auth');

exports.getEmailTemplates = (req, res, next) => {
	(async function () {
		try {
			const auth = getIdAndTypeFromAuth(req, res, next);
			if (!auth) {
				const error = new Error('Not Authorized!');
				error.statusCode = 401;
				next(error);
			}
			const { selectedCompany } = auth;

			const emailTemplates = await EmailTemplate.find({ company: selectedCompany }).select('name subject content');
			const count = await EmailTemplate.countDocuments({ company: selectedCompany });

			res.status(200).json({
				total: count,
				data: emailTemplates,
			});
		} catch (err) {
			next(err);
		}
	})();
};

exports.postEmailTemplate = (req, res, next) => {
	(async function () {
		try {
			const auth = getIdAndTypeFromAuth(req, res, next);
			if (!auth) {
				const error = new Error('Not Authorized!');
				error.statusCode = 401;
				next(error);
			}
			const { selectedCompany } = auth;

			await EmailTemplate.create({ company: selectedCompany, ...req.body });

			res.status(200).json({
				message: 'Successfully created!',
			});
		} catch (err) {
			next(err);
		}
	})();
};
