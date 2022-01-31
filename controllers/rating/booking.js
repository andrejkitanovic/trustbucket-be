const rp = require('request-promise');
const cheerio = require('cheerio');
const usePuppeteer = require('../../helpers/puppeteer');
const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');

const { getIdAndTypeFromAuth } = require('../auth');
const { updateRatingHandle } = require('../profile');
const Company = require('../../models/company');
const Rating = require('../../models/rating');

dayjs.extend(customParseFormat);

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
	const oldUrl = req.body.url;
	const removeLanguage = /\..{0,5}?\./;

	const url = oldUrl.replace(removeLanguage, '.');

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
			const { selectedCompany } = auth;
			const company = await Company.findById(selectedCompany);

			const result = await rp(url);
			const $ = cheerio.load(result);
			const json = await JSON.parse($('script[type="application/ld+json"]').html());

			const rating = {
				type: 'booking',
				rating: json.aggregateRating.ratingValue,
				ratingCount: json.aggregateRating.reviewCount,
				url,
			};
			await updateRatingHandle(company, rating);

			downloadBokingReviewsHandle(selectedCompany, url);
			res.json(rating);
		} catch (err) {
			next(err);
		}
	})();
};

exports.loadBookingReviews = (req, res, next) => {
	const oldUrl = req.body.url;
	const removeLanguage = /\..{0,5}?\./;

	const url = oldUrl.replace(removeLanguage, '.');

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
			const { selectedCompany } = auth;

			const items = await downloadBokingReviewsHandle(selectedCompany, url, true);

			res.json({
				count: items.length,
				data: items,
			});
		} catch (err) {
			next(err);
		}
	})();
};

const downloadBokingReviewsHandle = async (selectedCompany, url, load) => {
	const page = await usePuppeteer(url);
	await page.click('a.toggle_review');
	await page.waitForNetworkIdle();
	await page.waitForTimeout(300);

	const items = [];
	let result = await page.content();

	const loadReviews = async (items, result) => {
		const $ = cheerio.load(result);

		await $('div[itemprop=review]').map((index, el) => {
			const $el = cheerio.load(el);

			const date = $el('.c-review-block__right .c-review-block__date').text().replace('Reviewed:', '').trim();

			const object = {
				company: selectedCompany,
				type: 'booking',
				name: $el('.bui-avatar-block__title').text(),
				image: $el('.bui-avatar__image').attr('src'),
				rating: Number($el('.bui-review-score__badge').text().trim().replace(',', '.')),
				description: $el('.c-review__body').text().trim(),
				date: dayjs(date, 'MMMM D, YYYY'),
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

	if (!load) {
		await Rating.insertMany(items);
	}

	return items;
};
