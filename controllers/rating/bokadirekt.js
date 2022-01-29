const rp = require('request-promise');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const { isAbsoluteURL } = require('../../helpers/utils');
const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');

const { getIdAndTypeFromAuth } = require('../auth');
const { updateRatingHandle } = require('../profile');
const User = require('../../models/user');

dayjs.extend(customParseFormat);

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
						address: $el('.address').text(),
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

exports.downloadBokadirektReviews = (req, res, next) => {
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

			// LOGIC
			const browser = await puppeteer.launch();
			const page = await browser.newPage();
			await page.goto(url);
			await page.click('button.view-all-reviews');
			await page.waitForNetworkIdle();

			const loadMore = async () => {
				await page.click('.modal-content button.view-all-reviews');
				await page.waitForNetworkIdle();

				if (await page.$('.modal-content button.view-all-reviews')) {
					await loadMore();
				}
			};
			if (await page.$('.modal-content button.view-all-reviews')) {
				await loadMore();
			}

			const result = await page.content();

			const $ = cheerio.load(result);

			const items = [];
			await $('.modal-content div[itemprop=review]').map((index, el) => {
				const $el = cheerio.load(el);

				const imageSrc = $el('div.review-user img').attr('src');
				const image = isAbsoluteURL(imageSrc) ? imageSrc : 'https://www.bokadirekt.se' + imageSrc;

				const object = {
					user: id,
					type: 'bokadirekt',
					name: $el('span[itemprop=name]').text(),
					image: image,
					rating: Number($el('meta[itemprop=ratingValue]').attr('content')),
					description: $el('div.review-text').text(),
					date: dayjs($el('time[datetime]').attr('datetime'), 'YYYY-MM-DD'),
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
