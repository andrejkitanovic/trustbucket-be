const { getIdAndTypeFromAuth } = require('./auth');
const User = require('../models/user');
const Company = require('../models/company');

exports.changeDownloadingState = async (selectedCompany, type, state) => {
	try {
		console.log('Downloading State changed for type ' + type + ' to ' + (state ? '[DOWNLOADING]' : '[FINISHED]'));
		const company = await Company.findById(selectedCompany);
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
	} catch (err) {
		console.log('DOWNLOADING ERROR', err);
	}
};

exports.updateRatingHandle = async (selectedCompany, rating) => {
	try {
		const company = await Company.findById(selectedCompany);
		const ratings = company.ratings;
		const { type } = rating;

		let updatedRatings = ratings.filter((single) => single.type !== type);
		updatedRatings.push(rating);
		updatedRatings = calculateOverallRating(updatedRatings);

		company.ratings = updatedRatings;

		await company.save();
		return company;
	} catch (err) {
		console.log('UPDATING ERROR', err);
	}
};

exports.deleteRatingHandle = async (company, type) => {
	try {
		const ratings = company.ratings;

		let updatedRatings = ratings.filter((single) => single.type !== type);
		updatedRatings = calculateOverallRating(updatedRatings);

		company.ratings = updatedRatings;

		await company.save();
		return company;
	} catch (err) {
		console.log('DELETING ERROR', err);
	}
};

const calculateOverallRating = (ratings) => {
	const updatedRatings = ratings.filter((single) => single.type !== 'overall');

	const ratingCount = updatedRatings.reduce((prev, current) => prev + current.ratingCount, 0);
	const rating =
		updatedRatings.reduce((prev, current) => {
			if (!current.rating) return prev;
			return prev + current.rating * current.ratingCount;
		}, 0) / ratingCount;

	const overall = {
		type: 'overall',
		rating: isNaN(rating) ? null : rating,
		ratingCount,
	};

	return [overall, ...updatedRatings];
};

// ROUTES

exports.getProfile = async (req, res, next) => {
	try {
		const auth = getIdAndTypeFromAuth(req, res, next);
		if (!auth) {
			const error = new Error('Not Authorized!');
			error.statusCode = 401;
			next(error);
		}
		const { id } = auth;

		const profile = await User.findById(id);
		await profile.populate('selectedCompany');
		await profile.populate('companies', '_id name websiteURL address.name');
		res.status(200).json({
			data: profile,
		});
	} catch (err) {
		next(err);
	}
};

exports.updateProfile = async (req, res, next) => {
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

		await updatedUser.populate('selectedCompany', '_id name image websiteURL ratings');
		await updatedUser.populate('companies', '_id name');
		res.status(200).json({
			data: updatedUser,
			message: 'Profile successfully updated!',
		});
	} catch (err) {
		next(err);
	}
};

exports.deleteProfile = async (req, res, next) => {
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
};
