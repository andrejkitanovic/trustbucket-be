const { getIdAndTypeFromAuth } = require('../auth');
const { deleteRatingHandle } = require('../profile');
const Company = require('../../models/company');
const Rating = require('../../models/rating');
const mongoose = require('mongoose');
const _ = require('lodash');

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
			const count = await Rating.countDocuments({ company: selectedCompany });

			const notRepliedCount = await Rating.countDocuments({ company: selectedCompany, reply: undefined });

			res.status(200).json({
				total: count,
				totalNoReply: notRepliedCount,
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
				const rating = req.body.rating;

				filterObject.rating = {
					$gt: _.min(rating) - 1,
					$lte: _.max(rating),
				};
			}

			const additionalObject = {};

			if (req.body.reply === false) {
				additionalObject.reply = undefined;
			}

			const ratings = await Rating.find({ ...filterObject, ...additionalObject })
				.sort([[sortField, sortOrder === 'asc' ? 1 : -1]])
				.skip(Number((pageNumber - 1) * pageSize))
				.limit(Number(pageSize));
			const count = await Rating.countDocuments(filterObject);
			const notRepliedCount = await Rating.countDocuments({ ...filterObject, reply: undefined });

			res.status(200).json({
				total: count,
				totalNoReply: notRepliedCount,
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

			let matchObjectCore = {
				company: mongoose.Types.ObjectId(selectedCompany),
			};

			if (from && to) {
				matchObjectCore = {
					...matchObjectCore,
					date: {
						$gte: new Date(from),
						$lte: new Date(to),
					},
				};
			}

			const getStats = async (type) => {
				let matchObject = { ...matchObjectCore };
				if (type) {
					matchObject = { ...matchObject, type: type };
				}

				return await Rating.aggregate([
					{
						$match: matchObject,
					},
					{
						$group: {
							_id: { $dateToString: { format: '%Y-%m', date: '$date' } },
							total: { $sum: 1 },
							rating: { $avg: '$rating' },
						},
					},
					{ $sort: { _id: 1 } },
				]);
			};
			const overallStats = await getStats();

			const labels = [];
			overallStats.forEach((el) => labels.push(el._id));

			const stats = {
				countNoReply: 0,
				count: {},
				rating: {},
			};
			stats.countNoReply = await Rating.countDocuments({ ...matchObjectCore, reply: undefined });

			for (const type of types) {
				const elements = [];
				if (type === 'overall') {
					overallStats.forEach((el) => elements.push(el.total));
					stats[type] = elements;

					stats.count[type] = overallStats.reduce((sum, el) => sum + el.total, 0);
					stats.rating[type] = _.meanBy(overallStats, (el) => el.rating) || 0;
				} else {
					let typeStats = await getStats(type);
					stats.count[type] = typeStats.reduce((sum, el) => sum + el.total, 0);
					stats.rating[type] = _.meanBy(typeStats, (el) => el.rating) || 0;

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
