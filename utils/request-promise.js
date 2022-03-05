const rp = require('request-promise');

exports.useRp = (url) => {
	return rp({
		url,
		headers: {
			'User-Agent': 'Request-Promise',
		},
		json: true,
	});
};
