const jwt = require('jsonwebtoken');
const User = require('../models/user');

const auth = async (req, res, next) => {
	try {
		if (req.headers && req.headers.authorization) {
			let authorization = req.headers.authorization.split(' ')[1];
			let decoded = jwt.verify(authorization, process.env.DECODE_KEY);

			const { id, type, selectedCompany } = decoded;

			const user = await User.findById(user);
			if (!user) {
				return res.status(401).send({ message: 'User not found!' });
			}

			req.auth = {
				id,
				type,
				selectedCompany,
			};
		}
	} catch (err) {
		return res.status(401).send({ message: 'Not Authorized' });
	}

	return next();
};

module.exports = auth;
