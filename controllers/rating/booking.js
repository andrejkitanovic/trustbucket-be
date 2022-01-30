const rp = require('request-promise');
const cheerio = require('cheerio');
const usePuppeteer = require('../../helpers/puppeteer')

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
				url,
			};
			await updateRatingHandle(profile, rating);

			res.json(rating);
		} catch (err) {
			next(err);
		}
	})();
};

exports.downloadBookingReviews = (req, res, next) => {
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

			// LOGIC
			const page = await usePuppeteer(url);
			await page.click('a.toggle_review');
			await page.waitForNetworkIdle();
			await page.waitForTimeout(300)

			await page.screenshot({ path: 'test.png' });

			const items = [];
			let result = await page.content();

			const loadReviews = async (items, result) => {
				const $ = cheerio.load(result);

				await $('div[itemprop=review]').map((index, el) => {
					const $el = cheerio.load(el);

					// const imageSrc = $el('div.review-user img').attr('src');
					// const image = isAbsoluteURL(imageSrc) ? imageSrc : 'https://www.bokadirekt.se' + imageSrc;

					const object = {
						user: id,
						type: 'booking',
						name: $el('.bui-avatar-block__title').text(),
						image: $el('.bui-avatar__image').attr('src'),
						rating: Number($el('.bui-review-score__badge').text().trim().replace(',','.')),
					// 	description: $el('div.review-text').text(),
					// 	date: dayjs($el('time[datetime]').attr('datetime'), 'YYYY-MM-DD'),
					};

					items.push(object);
				});
			};

			await loadReviews(items, result);

			const loadMore = async () => {
				await page.click('.bui-pagination__next-arrow');
				await page.waitForNetworkIdle();

				result = await page.content();
				await loadReviews(items, result);

				if (await page.$('.bui-pagination__next-arrow:not(.bui-pagination__item--disabled)')) {
					await loadMore();
				}
			};
			if (await page.$('.bui-pagination__next-arrow:not(.bui-pagination__item--disabled)')) {
				await loadMore();
			}

			res.json({
				count: items.length,
				data: items,
			});
		} catch (err) {
			next(err);
		}
	})();
};
