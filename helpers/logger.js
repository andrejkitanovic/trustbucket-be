const logController = require('../controllers/log');
const geoip = require('geoip-lite');

module.exports = (app) => {
	app.use((req, res, next) => {
		const ip = req.headers['X-Forwarded-For'] || req.connection.remoteAddress || req.socket.remoteAddress;
		let location = {};

		if (ip) {
			console.log(ip);
			location = geoip.lookup(ip);
			console.log(location);
		}

		const { method, _parsedUrl } = req;

		next();

		res.on('finish', () => {
			const auth = req.auth;
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
