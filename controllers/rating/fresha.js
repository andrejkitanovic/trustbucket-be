const rp = require('request-promise');
const cheerio = require('cheerio');
const usePuppeteer = require('../../helpers/puppeteer');
const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');

const { getIdAndTypeFromAuth } = require('../auth');
const { updateRatingHandle, changeDownloadingState } = require('../profile');
const Company = require('../../models/company');
const Rating = require('../../models/rating');

dayjs.extend(customParseFormat);

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

			res.json(object);
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

			const { selectedCompany } = auth;
			const company = await Company.findById(selectedCompany);

			const result = await rp(url);
			const $ = cheerio.load(result);
			const json = await JSON.parse($('script[type="application/ld+json"]').html());

			const rating = {
				type: 'fresha',
				rating: json.aggregateRating.ratingValue,
				ratingCount: json.aggregateRating.reviewCount,
				url,
			};
			await updateRatingHandle(company, rating);

			downloadFreshaReviewsHandle(selectedCompany, url);
			res.json(rating);
		} catch (err) {
			next(err);
		}
	})();
};

exports.loadFreshaReviews = (req, res, next) => {
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
			const { selectedCompany } = auth;

			const items = await downloadFreshaReviewsHandle(selectedCompany, url, true);

			res.json({
				count: items.length,
				data: items,
			});
		} catch (err) {
			next(err);
		}
	})();
};

const downloadFreshaReviewsHandle = async (selectedCompany, url, load) => {
	const company = await Company.findById(selectedCompany);

	if (!load) {
		await changeDownloadingState(company, 'fresha', true);
	}

	const page = await usePuppeteer(url + '/reviews');

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

		// let image = null;

		// $el.prototype.exists = function (selector) {
		// 	return this.find(selector).length > 0;
		// };
		// if ($el(el).exists('div[data-qa=avatar-image]')) {
		// 	// image = $el('div[data-qa=avatar-image]')
		// 	console.log($el('div[data-qa=avatar-image]').css('background-image'))
		// }

		$el.prototype.count = function (selector) {
			return this.find(selector).length;
		};
		const object = {
			company: selectedCompany,
			type: 'fresha',
			name: $el('p[data-qa=review-user-name]').text(),
			image: null,
			rating: Number($el('div[data-qa=review-rating]').count('div[type=selected]')),
			description: $el('p[class*=StyledParagraph]').text(),
			date: dayjs($el('p[data-qa=review-appt-date]').text(), 'MMM D, YYYY'),
		};

		items.push(object);
	});

	if (!load) {
		await Rating.insertMany(items);
		await changeDownloadingState(company, 'fresha', false);
	}

	return items;
};

// MISSING IMAGE LOGIC
