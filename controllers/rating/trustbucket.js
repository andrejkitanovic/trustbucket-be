const Company = require('../../models/company');
const Rating = require('../../models/rating');
const Campaign = require('../../models/campaign');
const UnconfirmedRating = require('../../models/unconfirmedRating');
const { updateRatingHandle } = require('../profile');
const { confirmReview } = require('../../utils/mailer');

exports.getTrustbucketReviews = async (req, res, next) => {
	try {
		const { slug } = req.params;

		const company = await Company.findOne({
			slug: {
				$regex: new RegExp(slug, 'i'),
			},
		}).select('image name websiteURL email phone address socialLinks ratings reviewsPageLanguage');

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

		if (!req.body.campaignId) {
			const newUncofirmedRating = new UnconfirmedRating({
				company: company._id,
				rating,
				title,
				description,
				image,
				name,
				date: new Date(),
				email,
			});
			await newUncofirmedRating.save();
			await confirmReview({
				id: newUncofirmedRating._id,
				name,
				email,
				slug,
			});

			res.json({
				message: 'Verification Email Sent!',
			});
		} else {
			const campaignId = req.body.campaignId;

			const campaign = await Campaign.findById(campaignId);

			const newRating = new Rating({
				company: company._id,
				type: 'trustbucket',
				rating,
				title,
				description,
				image,
				name,
				date: new Date(),
				email,
			});
			await newRating.save();

			campaign.trustbucketRating =
				(campaign.trustbucketRating * campaign.verifiedReviews + rating) / (campaign.verifiedReviews + 1);
			campaign.verifiedReviews = campaign.verifiedReviews + 1;
			await campaign.save();

			const allRatings = await Rating.find({ company: company._id, type: 'trustbucket' }).select('rating');
			const avarageRating = allRatings.reduce((total, el) => total + el.rating, 0);
			const totalRatingCount = await Rating.countDocuments({ company: company._id, type: 'trustbucket' });

			updateRatingHandle(company._id, {
				type: 'trustbucket',
				rating: avarageRating / totalRatingCount,
				ratingCount: totalRatingCount,
			});

			res.json({
				message: 'Review posted!',
			});
		}
	} catch (err) {
		next(err);
	}
};

exports.confirmTrustbucketReview = async (req, res, next) => {
	try {
		const { id } = req.params;

		const uncofirmedRating = await UnconfirmedRating.findById(id);

		const newRating = new Rating({
			company: uncofirmedRating.company,
			type: 'trustbucket',
			rating: uncofirmedRating.rating,
			title: uncofirmedRating.title,
			description: uncofirmedRating.description,
			image: uncofirmedRating.image,
			name: uncofirmedRating.name,
			date: uncofirmedRating.date,
			email: uncofirmedRating.email,
		});
		await newRating.save();
		await uncofirmedRating.remove();

		const company = await Company.findById(uncofirmedRating.company);

		const allRatings = await Rating.find({ company: company._id, type: 'trustbucket' }).select('rating');
		const avarageRating = allRatings.reduce((total, el) => total + el.rating, 0);
		const totalRatingCount = await Rating.countDocuments({ company: company._id, type: 'trustbucket' });

		updateRatingHandle(company._id, {
			type: 'trustbucket',
			rating: avarageRating / totalRatingCount,
			ratingCount: totalRatingCount,
		});

		res.json({
			message: 'Review verified!',
		});
	} catch (err) {
		next(err);
	}
};

exports.postTrustbucketReply = async (req, res, next) => {
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
		const { id } = req.params;

		await Rating.findByIdAndUpdate(id, { reply: null });

		res.json({
			message: 'Successfully deleted reply!',
		});
	} catch (err) {
		next(err);
	}
};
