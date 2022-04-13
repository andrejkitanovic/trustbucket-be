const jwt = require('jsonwebtoken');
const User = require('../models/user');

const auth = async (req, res, next) => {
	try {
		if (req.headers && req.headers.authorization) {
			let authorization = req.headers.authorization.split(' ')[1];
			let decoded = jwt.verify(authorization, process.env.DECODE_KEY);

			const { id, type } = decoded;

			const user = await User.findById(id);
			if (!user) {
				return res.status(403).json({ message: 'User not found!' });
			}

			req.auth = {
				id,
				type,
				selectedCompany: user.selectedCompany,
			};
		}
	} catch (err) {
		return res.status(403).json({ message: 'Not Authorized' });
	}

	return next();
};

module.exports = auth;
