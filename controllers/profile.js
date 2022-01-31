const { getIdAndTypeFromAuth } = require('./auth');
const User = require('../models/user');
const Company = require('../models/company');

// HANDLES

exports.changeDownloadingState = async (company, type, state) => {
	const ratings = company.ratings;

	let updatedRatings = ratings.map((single) => {
		if (single.type === type) {
			single.downloading = state;
		}
		return single;
	});

	company.ratings = updatedRatings;

	await company.save();
	return company;
};

exports.updateRatingHandle = async (company, rating) => {
	const ratings = company.ratings;
	const { type } = rating;

	let updatedRatings = ratings.filter((single) => single.type !== type);
	updatedRatings.push(rating);
	updatedRatings = calculateOverallRating(updatedRatings);

	company.ratings = updatedRatings;

	await company.save();
	return company;
};

exports.deleteRatingHandle = async (company, type) => {
	const ratings = company.ratings;

	let updatedRatings = ratings.filter((single) => single.type !== type);
	updatedRatings = calculateOverallRating(updatedRatings);

	company.ratings = updatedRatings;

	await company.save();
	return company;
};

const calculateOverallRating = (ratings) => {
	const updatedRatings = ratings.filter((single) => single.type !== 'overall');
	if (!updatedRatings.length) return [{ type: 'overall', rating: null, ratingCount: 0 }];

	const ratingCount = updatedRatings.reduce((prev, current) => prev + current.ratingCount, 0);
	const rating =
		updatedRatings.reduce((prev, current) => {
			if (!current.rating) return prev;
			if (current.type !== 'booking') {
				return prev + current.rating * current.ratingCount;
			}
			return prev + (current.rating / 2) * current.ratingCount;
		}, 0) / ratingCount;

	const overall = {
		type: 'overall',
		rating,
		ratingCount,
	};

	return [overall, ...updatedRatings];
};

// ROUTES

exports.getProfile = (req, res, next) => {
	(async function () {
		try {
			const auth = getIdAndTypeFromAuth(req, res, next);
			if (!auth) {
				const error = new Error('Not Authorized!');
				error.statusCode = 401;
				next(error);
			}
			const { id } = auth;

			const profile = await User.findById(id);
			await profile.populate('selectedCompany', '_id name websiteURL ratings');
			await profile.populate('companies', '_id name');
			res.status(200).json({
				data: profile,
			});
		} catch (err) {
			next(err);
		}
	})();
};

exports.updateProfile = (req, res, next) => {
	(async function () {
		try {
			const auth = getIdAndTypeFromAuth(req, res, next);
			if (!auth) {
				const error = new Error('Not Authorized!');
				error.statusCode = 401;
				next(error);
			}
			const { id } = auth;

			const updatedUser = await User.findOneAndUpdate(
				{ _id: id },
				{
					...req.body,
				},
				{ new: true }
			);

			await updatedUser.populate('selectedCompany', '_id name websiteURL ratings');
			await updatedUser.populate('companies', '_id name');
			res.status(200).json({
				data: updatedUser,
				message: 'Profile successfully updated!',
			});
		} catch (err) {
			next(err);
		}
	})();
};

exports.deleteProfile = (req, res, next) => {
	(async function () {
		try {
			const auth = getIdAndTypeFromAuth(req, res, next);
			if (!auth) {
				const error = new Error('Not Authorized!');
				error.statusCode = 401;
				next(error);
			}
			const { id } = auth;

			const userDeleted = await User.deleteOne({ _id: id });
			if (!userDeleted) {
				const error = new Error('Profile not found!');
				error.statusCode = 404;
				return next(error);
			}

			res.status(200).json({
				message: 'Profile successfully deleted!',
			});
		} catch (err) {
			next(err);
		}
	})();
};
