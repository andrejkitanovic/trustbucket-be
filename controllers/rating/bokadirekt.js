const rp = require('request-promise');
const cheerio = require('cheerio');
const { isAbsoluteURL } = require('../../helpers/utils');
const usePuppeteer = require('../../utils/puppeteer');
const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');

const { getIdAndTypeFromAuth } = require('../auth');
const { updateRatingHandle, changeDownloadingState } = require('../profile');
const Company = require('../../models/company');
const Rating = require('../../models/rating');

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
			const { selectedCompany } = auth;
			const company = await Company.findById(selectedCompany);

			const result = await rp(url);
			const $ = cheerio.load(result);

			const ratingText = $('span[itemprop=ratingValue]').first().text();
			const ratingCountText = $('span[itemprop=ratingCount]').text();

			const rating = {
				type: 'bokadirekt',
				rating: ratingText ? Number(ratingText.trim()) : null,
				ratingCount: ratingCountText ? Number(ratingCountText.trim()) : 0,
				url,
			};
			await updateRatingHandle(company, rating);

			downloadBokadirektReviewsHandle(selectedCompany, url);
			res.json(rating);
		} catch (err) {
			next(err);
		}
	})();
};

exports.loadBokadirektReviews = (req, res, next) => {
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
			const { selectedCompany } = auth;

			const items = await downloadBokadirektReviewsHandle(selectedCompany, url, true);

			res.json({
				count: items.length,
				data: items,
			});
		} catch (err) {
			next(err);
		}
	})();
};

const downloadBokadirektReviewsHandle = async (selectedCompany, url, load) => {
	const company = await Company.findById(selectedCompany);

	if (!load) {
		await changeDownloadingState(company, 'bokadirekt', true);
	}

	const page = await usePuppeteer(url);
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

		const object = {
			company: selectedCompany,
			type: 'bokadirekt',
			name: $el('span[itemprop=name]').text(),
			rating: Number($el('meta[itemprop=ratingValue]').attr('content')),
			description: $el('div.review-text').text(),
			date: dayjs($el('time[datetime]').attr('datetime'), 'YYYY-MM-DD'),
		};

		items.push(object);
	});

	if (!load) {
		await Rating.insertMany(items);
		await changeDownloadingState(company, 'bokadirekt', false);
	}

	return items;
};

// ALL DONE
