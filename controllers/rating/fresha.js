const rp = require('request-promise');
const cheerio = require('cheerio');

const { getIdAndTypeFromAuth } = require('../auth');
const { updateRatingHandle } = require('../profile');
const Company = require('../../models/company');
const { getCluster } = require('../../utils/puppeteer');

exports.searchFreshaProfile = (req, res, next) => {
	const { q: url } = req.query;

	(async function () {
		try {
			const auth = getIdAndTypeFromAuth(req, res, next);
			if (!auth) {
				const error = new Error('Not Authorized!');
				error.statusCode = 401;
				next(error);
			}

			const result = await rp(url);
			const $ = cheerio.load(result);
			const json = await JSON.parse($('script[type="application/ld+json"]').html());

			const object = {
				title: json.name,
				image: json.image,
				address: json.address,
				link: url,
			};

			res.json(object);
		} catch (err) {
			next(err);
		}
	})();
};

exports.saveFreshaProfile = (req, res, next) => {
	const url = req.body.url;

	(async function () {
		try {
			if (!url || !url.includes('www.fresha.com/')) {
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
			const company = await Company.findById(selectedCompany);

			const result = await rp(url);
			const $ = cheerio.load(result);
			const json = await JSON.parse($('script[type="application/ld+json"]').html());

			const rating = {
				type: 'fresha',
				name: json.name,
				rating: json.aggregateRating.ratingValue,
				ratingCount: json.aggregateRating.reviewCount,
				url,
			};
			const cluster = await getCluster();
			await cluster.queue({
				url: url + '/reviews',
				type: 'fresha',
				selectedCompany,
			});

			await updateRatingHandle(company, rating);

			res.json(rating);
		} catch (err) {
			next(err);
		}
	})();
};
