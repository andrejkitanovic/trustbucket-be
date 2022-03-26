const Company = require('../../models/company');
const Rating = require('../../models/rating');

exports.getTrustbucketReviews = (req, res, next) => {
	(async function () {
		try {
			const { slug } = req.params;

			const company = await Company.findOne({
				name: {
					$regex: new RegExp(slug, 'i'),
				},
			}).select('image name websiteURL email phone address socialLinks ratings');

			res.json(company);
		} catch (err) {
			next(err);
		}
	})();
};

exports.postTrustbucketReviews = (req, res, next) => {
	(async function () {
		try {
			const company = await Company.findOne({
				name: {
					$regex: new RegExp(slug, 'i'),
				},
			})
			const rating = new Rating({
				company: company._id,
				type: 'trustbucket',
				url: '',
				// image: $el('img').attr('src'),
				// name:,
				// description:,
				date: new Date(),
			});

			await rating.save();

			res.json({
				message:"Successfully commented!"
			});
		} catch (err) {
			next(err);
		}
	})();
};
