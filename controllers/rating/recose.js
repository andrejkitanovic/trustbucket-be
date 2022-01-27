const rp = require('request-promise');
const cheerio = require('cheerio');

const { getIdAndTypeFromAuth } = require('../auth');
const { updateRatingHandle } = require('../profile');
const User = require('../../models/user');

exports.searchRecoseProfile = (req, res, next) => {
	const { q } = req.query;
	const url = `https://www.reco.se/sok/s?q=${q}&page=1`;

	(async function () {
		try {
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
			const items = [];
			await $('div.media.clfx')
				.slice(0, 3)
				.map((index, el) => {
					const $el = cheerio.load(el);

					const object = {
						title: $el('a.nou.uh').text(),
						image: 'https:' + $el('img').attr('data-picture'),
						link: 'https://www.reco.se' + $el('a.nou.uh').attr('href'),
					};
					items.push(object);
				});

			res.json(items);
		} catch (err) {
			next(err);
		}
	})();
};

exports.saveRecoseProfile = (req, res, next) => {
	const url = req.body.url;

	(async function () {
		try {
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
				type: 'recose',
				rating: json.aggregateRating.ratingValue,
				ratingCount: json.aggregateRating.ratingCount,
			};
			await updateRatingHandle(profile, rating);

			res.json(json);
		} catch (err) {
			next(err);
		}
	})();
};
