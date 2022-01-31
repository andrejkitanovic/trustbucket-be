const { getIdAndTypeFromAuth } = require('../auth');
const { deleteRatingHandle } = require('../profile');
const Company = require('../../models/company');
const Rating = require('../../models/rating');

exports.getRatings = (req, res, next) => {
	(async function () {
		try {
			const auth = getIdAndTypeFromAuth(req, res, next);
			if (!auth) {
				const error = new Error('Not Authorized!');
				error.statusCode = 401;
				next(error);
			}
			const { selectedCompany } = auth;

			const ratings = await Rating.find({ company: selectedCompany });
			const count = await Rating.find({ company: selectedCompany }).countDocuments();

			res.status(200).json({
				total: count,
				data: ratings,
			});
		} catch (err) {
			next(err);
		}
	})();
};

exports.filterRatings = (req, res, next) => {
	(async function () {
		try {
			const auth = getIdAndTypeFromAuth(req, res, next);
			if (!auth) {
				const error = new Error('Not Authorized!');
				error.statusCode = 401;
				next(error);
			}

			const { pageNumber, pageSize, sortField, sortOrder } = req.body.queryParams;
			const { selectedCompany } = auth;

			const filterObject = {
				company: selectedCompany,
			};

			if (req.body.type) {
				filterObject.type = req.body.type;
			}
			if (req.body.rating) {
				filterObject.rating = JSON.parse(req.body.rating);
			}

			const ratings = await Rating.find(filterObject)
				.sort([[sortField, sortOrder === 'asc' ? 1 : -1]])
				.skip(Number((pageNumber - 1) * pageSize))
				.limit(Number(pageSize));
			const count = await Rating.find(filterObject).countDocuments();

			res.status(200).json({
				total: count,
				data: ratings,
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
			const { selectedCompany } = auth;

			const company = await Company.findById(selectedCompany);

			await deleteRatingHandle(company, type);
			await Rating.deleteMany({ company: selectedCompany, type });

			res.status(200).json({
				message: `Rating for ${type} successfully disconnected!`,
			});
		} catch (err) {
			next(err);
		}
	})();
};