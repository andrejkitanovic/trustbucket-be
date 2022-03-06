const InvitationSettings = require('../models/invitationSettings');
const { getIdAndTypeFromAuth } = require('./auth');

exports.getInvitationSettings = (req, res, next) => {
	(async function () {
		try {
			const auth = getIdAndTypeFromAuth(req, res, next);
			if (!auth) {
				const error = new Error('Not Authorized!');
				error.statusCode = 401;
				next(error);
			}
			const { selectedCompany } = auth;

			const invitationSettings = await InvitationSettings.findOne({ company: selectedCompany });
			res.status(200).json(invitationSettings);
		} catch (err) {
			next(err);
		}
	})();
};

exports.updateInvitationSettings = (req, res, next) => {
	(async function () {
		try {
			const auth = getIdAndTypeFromAuth(req, res, next);
			if (!auth) {
				const error = new Error('Not Authorized!');
				error.statusCode = 401;
				next(error);
			}
			const { selectedCompany } = auth;

			const invitationSettings = await InvitationSettings.findOneAndUpdate(
				{ company: selectedCompany },
				{
					...req.body,
				},
				{ new: true }
			);

			res.status(200).json(invitationSettings);
		} catch (err) {
			next(err);
		}
	})();
};