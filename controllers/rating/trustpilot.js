const cheerio = require('cheerio');

const { useRp } = require('../../utils/request-promise');
const { getIdAndTypeFromAuth } = require('../auth');
const { updateRatingHandle } = require('../profile');
const Company = require('../../models/company');
const { getCluster } = require('../../utils/puppeteer');

exports.searchTrustpilotProfile = (req, res, next) => {
	const { q: url } = req.query;

	(async function () {
		try {
			if (!url || !url.includes('trustpilot.com/review/')) {
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
				title: json[1].name,
				// image: json.image,
				address: json[0].address && json[0].address.streetAddress,
				link: url,
			};

			res.json(object);
		} catch (err) {
			next(err);
		}
	})();
};

exports.saveTrustpilotProfile = (req, res, next) => {
	const url = req.body.url;

	(async function () {
		try {
			if (!url || !url.includes('trustpilot.com/review/')) {
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
				type: 'trustpilot',
				rating: Number(json[0].aggregateRating.ratingValue),
				ratingCount: Number(json[0].aggregateRating.reviewCount),
				url,
			};
			const cluster = await getCluster();
			await cluster.queue({
				url: url,
				type: 'trustpilot',
				selectedCompany,
			});
			await updateRatingHandle(selectedCompany, rating);

			// downloadTrustpilotReviewsHandle(selectedCompany, url);
			res.json(rating);
		} catch (err) {
			next(err);
		}
	})();
};
