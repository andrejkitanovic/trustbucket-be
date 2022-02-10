const { getIdAndTypeFromAuth } = require('../auth');
const { deleteRatingHandle } = require('../profile');
const Company = require('../../models/company');
const Rating = require('../../models/rating');
const mongoose = require('mongoose');

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
				filterObject.rating = req.body.rating;
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

exports.stats = (req, res, next) => {
	(async function () {
		try {
			const auth = getIdAndTypeFromAuth(req, res, next);
			const { from, to } = req.query;
			if (!auth) {
				const error = new Error('Not Authorized!');
				error.statusCode = 401;
				next(error);
			}
			const { selectedCompany } = auth;

			const company = await Company.findById(selectedCompany);
			const types = company.ratings.map((el) => !el.downloading && el.type);

			const getStats = async (type) => {
				let matchObject = {
					company: mongoose.Types.ObjectId(selectedCompany),
				};

				if (type) {
					matchObject = { ...matchObject, type: type };
				}

				if (from && to) {
					matchObject = {
						...matchObject,
						date: {
							$gte: new Date(from),
							$lte: new Date(to),
						},
					};
				}

				return await Rating.aggregate([
					{
						$match: matchObject,
					},
					{
						$group: {
							_id: { $dateToString: { format: '%Y-%m', date: '$date' } },
							total: { $sum: 1 },
						},
					},
					{ $sort: { _id: 1 } },
				]);
			};
			const overallStats = await getStats();

			const labels = [];
			overallStats.forEach((el) => labels.push(el._id));

			const stats = {};

			for (const type of types) {
				const elements = [];
				if (type === 'overall') {
					overallStats.forEach((el) => elements.push(el.total));
					stats[type] = elements;
				} else {
					let typeStats = await getStats(type);
					labels.forEach((date) => {
						let returned = false;
						typeStats.forEach((el) => {
							if (el._id === date) {
								elements.push(el.total);
								returned = true;
							}
						});

						if (!returned) elements.push(0);
					});
					stats[type] = elements;
				}
			}

			res.status(200).json({
				labels,
				...stats,
			});
		} catch (err) {
			next(err);
		}
	})();
};
