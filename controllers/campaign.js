const { sendEmail } = require('../utils/mailer');
const { getIdAndTypeFromAuth } = require('./auth');

exports.postCampaign = (req, res, next) => {
	(async function () {
		try {
			const auth = getIdAndTypeFromAuth(req, res, next);
			if (!auth) {
				const error = new Error('Not Authorized!');
				error.statusCode = 401;
				next(error);
			}
			const { selectedCompany } = auth;

            const sended = await sendEmail();
			console.log(sended)
			// await EmailTemplate.create({ company: selectedCompany, ...req.body });

			res.status(200).json({
				message: 'Successfully sent!',
			});
		} catch (err) {
			next(err);
		}
	})();
};
