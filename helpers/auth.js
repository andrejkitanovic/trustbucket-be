const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
	try {
		if (req.headers && req.headers.authorization) {
			let authorization = req.headers.authorization.split(' ')[1];
			let decoded = jwt.verify(authorization, process.env.DECODE_KEY);
			req.auth = {
				id: decoded.id,
				type: decoded.type,
				selectedCompany: decoded.selectedCompany,
			};
		}
	} catch (err) {
		return res.status(401).send('Not Authorized');
	}

	return next();
};

module.exports = auth;
