const rp = require('request-promise');
const cheerio = require('cheerio');

const { getIdAndTypeFromAuth } = require('../auth');
const { updateRatingHandle } = require('../profile');
const User = require('../../models/user');

exports.searchBookingProfile = async (req, res, next) => {
	const { q: url } = req.query;

	(async function () {
		try {
			if (!url || !url.includes('www.booking.com/hotel/')) {
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

			const result = await rp(url);
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
	const url = req.body.url;

	(async function () {
		try {
			if (!url || !url.includes('www.booking.com/hotel/')) {
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
			const { id } = auth;

			const profile = await User.findById(id);

			const result = await rp(url);
			const $ = cheerio.load(result);
			const json = await JSON.parse($('script[type="application/ld+json"]').html());

			const rating = {
				type: 'booking',
				rating: json.aggregateRating.ratingValue,
				ratingCount: json.aggregateRating.reviewCount,
				url
			};
			await updateRatingHandle(profile, rating);

			res.json(rating);
		} catch (err) {
			next(err);
		}
	})();
};
