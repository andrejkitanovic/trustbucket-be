const { getIdAndTypeFromAuth } = require('./auth');
const User = require('../models/user');

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

			// const { firstName, lastName, role, country, language } = req.body;

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
