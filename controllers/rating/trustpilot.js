const cheerio = require('cheerio');

const { useRp } = require('../../utils/request-promise');
const { getIdAndTypeFromAuth } = require('../auth');
const { updateRatingHandle } = require('../profile');
const { getCluster } = require('../../utils/puppeteer');

exports.searchTrustpilotProfile = (req, res, next) => {
	const { q: url } = req.body;

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
			const jsonParse = await JSON.parse($('script[type="application/ld+json"][data-business-unit-json-ld]').html());
			const json = jsonParse['@graph'].find((object) => object['@type'] === 'LocalBusiness');

			const object = {
				title: json.name,
				image: $('img[class*=[styles_image]').attr('src'),
				address: json.address && json.address.streetAddress,
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
			const jsonParse = await JSON.parse($('script[type="application/ld+json"][data-business-unit-json-ld]').html());
			const json = jsonParse['@graph'].find((object) => object['@type'] === 'LocalBusiness');

			const rating = {
				type: 'trustpilot',
				rating: Number(json.aggregateRating.ratingValue),
				ratingCount: Number(json.aggregateRating.reviewCount),
				url,
			};
			await updateRatingHandle(selectedCompany, rating);
			const cluster = await getCluster();
			await cluster.queue({
				url: url,
				type: 'trustpilot',
				selectedCompany,
			});

			// downloadTrustpilotReviewsHandle(selectedCompany, url);
			res.json(rating);
		} catch (err) {
			next(err);
		}
	})();
};
