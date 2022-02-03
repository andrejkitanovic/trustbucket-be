const absolutURLRegex = new RegExp('^(?:[a-z]+:)?//', 'i');

const throwError = (condition, { message, statusCode }, next) => {
	if (!condition) return;
	const newError = new Error(message);
	newError.statusCode = statusCode;
	return next(newError);
};

exports.isAbsoluteURL = (string) => absolutURLRegex.test(string);
exports.throwError = throwError;
