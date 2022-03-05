const { sendEmail } = require('../utils/mailer');
const { getIdAndTypeFromAuth } = require('./auth');
const EmailTemplate = require('../models/emailTemplate');
const Campaign = require('../models/campaign');

exports.postCampaign = (req, res, next) => {
	(async function () {
		try {
			const { templateId, reminder, recievers } = req.body;

			const auth = getIdAndTypeFromAuth(req, res, next);
			if (!auth) {
				const error = new Error('Not Authorized!');
				error.statusCode = 401;
				next(error);
			}
			const { selectedCompany } = auth;

			const template = await EmailTemplate.findById(templateId).select('subject content');

			const campaignObject = new Campaign({
				company: selectedCompany,
				emailTemplate: templateId,
				reminder,
				recievers,
			});
			const campaign = await campaignObject.save();
			await sendEmail(template, recievers, campaign._id);

			res.status(200).json({
				campaign: campaignObject,
				message: 'Successfully sent!',
			});
		} catch (err) {
			next(err);
		}
	})();
};
