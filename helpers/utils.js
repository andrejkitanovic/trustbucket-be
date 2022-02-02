const absolutURLRegex = new RegExp('^(?:[a-z]+:)?//', 'i');

const throwError = ({ message, statusCode }, next) => {
	const newError = new Error(message);
	newError.statusCode = statusCode;
	return next(newError);
};

exports.isAbsoluteURL = (string) => absolutURLRegex.test(string);
exports.throwError = throwError;
