const { validationResult } = require('express-validator');

const validation = async (req, res, next) => {
	const errors = validationResult(req);

	if (errors.isEmpty()) {
		return next();
	}

	if (!errors.isEmpty()) {
		return res.status(400).json({
			message: errors
				.array({ onlyFirstError: true })
				.map((error) => error.msg)
				.join(', '),
		});
	}

	return next();
};

module.exports = validation;
