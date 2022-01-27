const { getIdAndTypeFromAuth } = require('./auth');
const User = require('../models/user');

// HANDLES

exports.updateRatingHandle = async (user, rating) => {
	const ratings = user.ratings;
	const { type } = rating;

	const updatedRatings = ratings.filter((single) => single.type !== type);
	updatedRatings.push(rating);

	user.ratings = updatedRatings;

	await user.save();
	return user;
};

const deleteRatingHandle = async (user, type) => {
	const ratings = user.ratings;

	const updatedRatings = ratings.filter((single) => single.type !== type);

	user.ratings = updatedRatings;

	await user.save();
	return user;
};
exports.deleteRatingHandle

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

exports.deleteRating = (req, res, next) => {
	const { type } = req.query;
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

			await deleteRatingHandle(profile, type);

			res.status(200).json({
				message: `Rating for ${type} successfully disconnected!`,
			});
		} catch (err) {
			next(err);
		}
	})();
};
