const logController = require('../controllers/log');
const geoip = require('geoip-lite');

module.exports = (app) => {
	app.use((req, res, next) => {
		const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;
		let location = {};

		if (ip) {
			location = geoip.lookup(ip);
		}

		const { method, _parsedUrl } = req;
		const auth = req.auth;
		next();

		res.on('finish', () => {
			const { statusCode } = res;

			const logObject = {
				method,
				ip,
				location,
				endpoint: _parsedUrl.pathname,
				status: statusCode,
				authenticated: !!auth,
				user: auth && auth.id,
			};

			logController.postLog(logObject);
		});
	});
};
