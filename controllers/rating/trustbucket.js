const Company = require('../../models/company');
const Rating = require('../../models/rating');
const UnconfirmedRating = require('../../models/unconfirmedRating');
const { updateRatingHandle } = require('../profile');
const { getIdAndTypeFromAuth } = require('../auth');
const { confirmReview } = require('../../utils/mailer');

exports.getTrustbucketReviews = async (req, res, next) => {
	try {
		const { slug } = req.params;

		const company = await Company.findOne({
			slug: {
				$regex: new RegExp(slug, 'i'),
			},
		}).select('image name websiteURL email phone address socialLinks ratings');

		res.json(company);
	} catch (err) {
		next(err);
	}
};

exports.postTrustbucketReviews = async (req, res, next) => {
	try {
		const { slug, rating, title, description, image, name, email } = req.body;

		const company = await Company.findOne({
			slug: {
				$regex: new RegExp(slug, 'i'),
			},
		});
		const newRating = new UnconfirmedRating({
			company: company._id,
			// type: 'trustbucket',
			rating,
			title,
			description,
			image,
			name,
			date: new Date(),
		});

		await confirmReview({
			id: newRating._id,
			rating,
			title,
			description,
			email,
			name,
		});

		await newRating.save();

		// const allRatings = await Rating.find({ company: company._id, type: 'trustbucket' }).select('rating');
		// const avarageRating = allRatings.reduce((total, el) => total + el.rating, 0);
		// const totalRatingCount = await Rating.count({ company: company._id, type: 'trustbucket' });

		// updateRatingHandle(company._id, {
		// 	type: 'trustbucket',
		// 	rating: avarageRating / totalRatingCount,
		// 	ratingCount: totalRatingCount,
		// });

		res.json({
			message: 'Verification Email Sent!',
		});
	} catch (err) {
		next(err);
	}
};

exports.postTrustbucketReply = async (req, res, next) => {
	const auth = getIdAndTypeFromAuth(req, res, next);
	if (!auth) {
		const error = new Error('Not Authorized!');
		error.statusCode = 401;
		next(error);
	}

	try {
		const { id, reply } = req.body;

		await Rating.findByIdAndUpdate(id, { reply: { text: reply } });

		res.json({
			message: 'Successfully replied!',
		});
	} catch (err) {
		next(err);
	}
};

exports.deleteTrustbucketReply = async (req, res, next) => {
	try {
		const auth = getIdAndTypeFromAuth(req, res, next);
		if (!auth) {
			const error = new Error('Not Authorized!');
			error.statusCode = 401;
			next(error);
		}

		const { id } = req.params;

		await Rating.findByIdAndUpdate(id, { reply: null });

		res.json({
			message: 'Successfully deleted reply!',
		});
	} catch (err) {
		next(err);
	}
};
