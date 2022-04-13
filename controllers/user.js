const User = require('../models/user');

exports.getUsers = async (req, res, next) => {
	try {
		const { id } = req.auth;

		const users = await User.find({ _id: { $ne: id } });
		const count = await User.find({ _id: { $ne: id } }).countDocuments();

		res.status(200).json({
			total: count,
			data: users,
		});
	} catch (err) {
		next(err);
	}
};

exports.filterUsers = async (req, res, next) => {
	try {
		const { pageNumber, pageSize, sortField, sortOrder } = req.body.queryParams;
		const { id } = req.auth;

		const users = await User.find({ _id: { $ne: id } })
			.sort([[sortField, sortOrder === 'asc' ? 1 : -1]])
			.skip(Number((pageNumber - 1) * pageSize))
			.limit(Number(pageSize));
		const count = await User.find({ _id: { $ne: id } }).countDocuments();

		res.status(200).json({
			data: users,
			total: count,
		});
	} catch (err) {
		next(err);
	}
};

exports.deleteUser = async (req, res, next) => {
	try {
		const { id } = req.auth;

		const findId = req.query.id;

		const userDeleted = await User.deleteOne({ _id: findId });

		if (!userDeleted) {
			const error = new Error('User not found!');
			error.statusCode = 404;
			return next(error);
		}

		const users = await User.find({ _id: { $ne: id } });
		const count = await User.find({ _id: { $ne: id } }).countDocuments();

		res.status(200).json({
			data: users,
			total: count,
			message: 'User successfully deleted!',
		});
	} catch (err) {
		next(err);
	}
};
