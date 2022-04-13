const { getIdAndTypeFromAuth } = require('./auth');
const Log = require('../models/log');

exports.getLogs = async (req, res, next) => {
	try {
		const auth = getIdAndTypeFromAuth(req, res, next);
		if (!auth) {
			const error = new Error('Not Authorized!');
			error.statusCode = 401;
			next(error);
		}

		const { id } = auth;

		const logs = await Log.find({ user: id }).populate('user', 'email');
		const count = await Log.find({ user: id }).countDocuments();

		res.status(200).json({
			data: logs,
			total: count,
		});
	} catch (err) {
		next(err);
	}
};

exports.filterLogs = async (req, res, next) => {
	try {
		const auth = getIdAndTypeFromAuth(req, res, next);
		if (!auth) {
			const error = new Error('Not Authorized!');
			error.statusCode = 401;
			next(error);
		}

		const { pageNumber, pageSize, sortField, sortOrder } = req.body.queryParams;

		const { id } = auth;

		const logs = await Log.find({ user: id })
			.sort([[sortField, sortOrder === 'asc' ? 1 : -1]])
			.skip(Number((pageNumber - 1) * pageSize))
			.limit(Number(pageSize))
			.populate('user', 'email');
		const count = await Log.find({ user: id }).countDocuments();

		res.status(200).json({
			data: logs,
			total: count,
		});
	} catch (err) {
		next(err);
	}
};

exports.postLog = async (log) => {
	try {
		const logObject = new Log(log);
		logObject.save();
	} catch (err) {
		next(err);
	}
};
