const rp = require('request-promise');
const cheerio = require('cheerio');
const usePuppeteer = require('../../helpers/puppeteer');

const { getIdAndTypeFromAuth } = require('../auth');
const { updateRatingHandle } = require('../profile');
const User = require('../../models/user');

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

			res.json(object)
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
			const { id } = auth;

			const profile = await User.findById(id);

			const result = await rp(url);
			const $ = cheerio.load(result);
			const json = await JSON.parse($('script[type="application/ld+json"]').html());

			const rating = {
				type: 'fresha',
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

exports.downloadFreshaReviews = (req, res, next) => {
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
			const { id } = auth;

			// LOGIC
			const page = await usePuppeteer(url + '/reviews');
			// await page.click('a[data-qa=see-all-reviews-btn]');
			// await page.waitForNetworkIdle();

			const loadMore = async () => {
				await page.click('div[data-qa=reviews-list] button');
				await page.waitForNetworkIdle();

				if (await page.$('div[data-qa=reviews-list] button')) {
					await loadMore();
				}
			};
			if (await page.$('div[data-qa=reviews-list] button')) {
				await loadMore();
			}

			const result = await page.content();
			const $ = cheerio.load(result);

			const items = [];
			await $('div[data-qa=reviews-list] li').map((index, el) => {
				const $el = cheerio.load(el);

				// let image = 'https://www.reco.se/assets/images/icons/default-user.svg';

				// $el.prototype.exists = function (selector) {
				// 	return this.find(selector).length > 0;
				// };
				// if ($el('.review-card--reviewer-person-image').exists('img')) {
				// 	image = $el('.review-card--reviewer-person-image img').attr('src').trim();
				// }

				$el.prototype.count = function (selector) {
					return this.find(selector).length;
				};
				const object = {
					user: id,
					type: 'fresha',
					name: $el('p[data-qa=review-user-name]').text(),
					// image: image,
					rating: Number($el('div[data-qa=review-rating]').count('div[type=selected]')),
					// description: $el('p[data-qa=review-text]').html(),
					// date: dayjs($el('.submit-date').text(), 'YYYY-MM-DD'),
				};

				items.push(object);
			});

			res.json({
				count: items.length,
				data: items,
			});
		} catch (err) {
			next(err);
		}
	})();
};
