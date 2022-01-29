const rp = require('request-promise');
const cheerio = require('cheerio');

const { getIdAndTypeFromAuth } = require('../auth');
const { updateRatingHandle } = require('../profile');
const User = require('../../models/user');

exports.searchBokadirektProfile = async (req, res, next) => {
	const { q } = req.query;
	const url = `https://www.bokadirekt.se/${q}/var`;

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

			const items = [];
			await $('.card')
				.slice(0, 3)
				.map((index, el) => {
					const $el = cheerio.load(el);

					const object = {
						title: $el('.card-title').text(),
						image: $el('.card-image img').attr('src'),
						link: 'https://www.bokadirekt.se' + $el(el).attr('href'),
					};
					items.push(object);
				});
			if (!items.length) throw new Error('Not Found!');

			res.json(items[0]);
		} catch (err) {
			next(err);
		}
	})();
};

exports.saveBokadirektProfile = (req, res, next) => {
	const url = req.body.url;

	(async function () {
		try {
			if (!url || !url.includes('www.bokadirekt.se/places/')) {
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

			const ratingText = $('span[itemprop=ratingValue]').first().text();
			const ratingCountText = $('span[itemprop=ratingCount]').text();

			const rating = {
				type: 'bokadirekt',
				rating: ratingText ? Number(ratingText.trim()) : null,
				ratingCount: ratingCountText ? Number(ratingCountText.trim()) : 0,
			};
			await updateRatingHandle(profile, rating);

			res.json(rating);
		} catch (err) {
			next(err);
		}
	})();
};
