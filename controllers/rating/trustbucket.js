const Company = require('../../models/company');
const Rating = require('../../models/rating');
const { updateRatingHandle } = require('../profile');

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
			const { slug, rating, title, description, image, name, email } = req.body;

			const company = await Company.findOne({
				name: {
					$regex: new RegExp(slug, 'i'),
				},
			});
			const newRating = new Rating({
				company: company._id,
				type: 'trustbucket',
				rating,
				title,
				description,
				image,
				name,
				date: new Date(),
			});

			await newRating.save();

			const allRatings = await Rating.find({ company: company._id, type: 'trustbucket' }).select('rating');
			const avarageRating = allRatings.reduce((total, el) => total + el.rating, 0);
			const totalRatingCount = await Rating.count({ company: company._id, type: 'trustbucket' });

			updateRatingHandle(company._id, {
				type: 'trustbucket',
				rating: avarageRating / totalRatingCount,
				ratingCount: totalRatingCount,
			});

			res.json({
				message: 'Successfully commented!',
			});
		} catch (err) {
			next(err);
		}
	})();
};
