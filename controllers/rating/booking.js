const cheerio = require('cheerio');

const { useRp } = require('../../utils/request-promise');
const { getIdAndTypeFromAuth } = require('../auth');
const { updateRatingHandle } = require('../profile');
const Company = require('../../models/company');
const { getCluster } = require('../../utils/puppeteer');

exports.searchBookingProfile = async (req, res, next) => {
	const { q: url } = req.query;

	(async function () {
		try {
			if (!url || !url.includes('booking.com/hotel/')) {
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
				image: json.image,
				address: json.address && json.address.streetAddress,
				link: json.url,
			};

			res.json(object);
		} catch (err) {
			next(err);
		}
	})();
};

exports.saveBookingProfile = (req, res, next) => {
	const oldUrl = req.body.url;
	const removeLanguage = /\..{0,5}?\./;

	const url = oldUrl.replace(removeLanguage, '.en-gb.');

	(async function () {
		try {
			if (!url || !url.includes('booking.com/hotel/')) {
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

			const result = await useRp(url);
			const $ = cheerio.load(result);
			const json = await JSON.parse($('script[type="application/ld+json"]').html());

			const rating = {
				type: 'booking',
				name: $('#hp_hotel_name_reviews').text().trim(),
				rating: json.aggregateRating.ratingValue / 2,
				ratingCount: json.aggregateRating.reviewCount,
				url,
			};
			const cluster = await getCluster();
			await cluster.queue({
				url: url,
				type: 'booking',
				selectedCompany,
			});
			await updateRatingHandle(company, rating);

			res.json(rating);
		} catch (err) {
			next(err);
		}
	})();
};
