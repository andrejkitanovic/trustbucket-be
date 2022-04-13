const cheerio = require('cheerio');

const { useRp } = require('../../utils/request-promise');
const { getIdAndTypeFromAuth } = require('../auth');
const { updateRatingHandle } = require('../profile');
const { getCluster } = require('../../utils/puppeteer');

exports.searchHittaProfile = async (req, res, next) => {
	const { q: url } = req.body;

	try {
		if (!url || !url.includes('hitta.se/')) {
			const error = new Error('Not Valid URL!');
			error.statusCode = 422;
			next(error);
		}

		const auth = getIdAndTypeFromAuth(req, res, next);
		if (!auth) {
			const error = new Error('Not Authorized!');
			error.statusCode = 401;
			next(error);
		}

		const result = await useRp(url);

		const $ = cheerio.load(result);
		const json = await JSON.parse($('script[type="application/ld+json"]').html());

		const object = {
			title: json.name,
			image: json.logo,
			address: json.address && json.address.streetAddress,
			link: url,
		};

		res.json(object);
	} catch (err) {
		next(err);
	}
};

exports.saveHittaProfile = async (req, res, next) => {
	const url = req.body.url;

	try {
		if (!url || !url.includes('hitta.se/')) {
			const error = new Error('Not Valid URL!');
			error.statusCode = 422;
			next(error);
		}

		const auth = getIdAndTypeFromAuth(req, res, next);
		if (!auth) {
			const error = new Error('Not Authorized!');
			error.statusCode = 401;
			next(error);
		}
		const { selectedCompany } = auth;

		const result = await useRp(url);
		const $ = cheerio.load(result);
		const json = await JSON.parse($('script[type="application/ld+json"]').html());

		const rating = {
			type: 'hitta',
			name: json.name,
			rating: json.aggregateRating.ratingValue,
			ratingCount: json.aggregateRating.ratingCount,
			url,
		};
		await updateRatingHandle(selectedCompany, rating);
		const cluster = await getCluster();
		await cluster.queue({
			url: url,
			type: 'hitta',
			selectedCompany,
		});

		res.json(rating);
	} catch (err) {
		next(err);
	}
};
