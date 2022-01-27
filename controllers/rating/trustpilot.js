const rp = require('request-promise');
const cheerio = require('cheerio');

const { getIdAndTypeFromAuth } = require('../auth');
const { updateRatingHandle } = require('../profile');
const User = require('../../models/user');

exports.searchTrustpilotProfile = (req, res, next) => {
	const { q } = req.query;
	const url = `https://www.trustpilot.com/search?query=${q}`;

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
			console.log(url)
			const result = await rp(url);

			const $ = cheerio.load(result);
			const items = await JSON.parse($('.item').html());

			console.log(items);

			// const rating = {
			// 	type: 'recose',
			// 	rating: json.aggregateRating.ratingValue,
			// 	ratingCount: json.aggregateRating.ratingCount,
			// };
			// await updateRatingHandle(profile, rating);

			res.json(items);
		} catch (err) {
			next(err);
		}
	})();
};
