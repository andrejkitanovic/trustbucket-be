const Company = require('../../models/company');

exports.getTrustbucketReviews = (req, res, next) => {
	(async function () {
		try {
			const { slug } = req.params;

			const company = await Company.findOne({
				name: {
					$regex: new RegExp(slug, 'i'),
				},
			}).select('image name websiteURL email phone address socialLinks');

			res.json(company);
		} catch (err) {
			next(err);
		}
	})();
};
