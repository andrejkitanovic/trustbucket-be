const axios = require('axios');
const cheerio = require('cheerio');
const usePuppeteer = require('../../utils/puppeteer');

const { reverseFromNow } = require('../../utils/dayjs');
const { getIdAndTypeFromAuth } = require('../auth');
const { updateRatingHandle, changeDownloadingState } = require('../profile');
const Company = require('../../models/company');
const Rating = require('../../models/rating');

exports.getGoogleProfile = (req, res, next) => {
	const fields = ['formatted_address', 'name', 'place_id', 'icon_background_color', 'rating', 'geometry'].join('%2C');
	const textquery = req.query.q;
	const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?fields=${fields}&input=${textquery}&inputtype=textquery&key=${process.env.API_KEY_GOOGLE}`;

	(async function () {
		try {
			const auth = getIdAndTypeFromAuth(req, res, next);
			if (!auth) {
				const error = new Error('Not Authorized!');
				error.statusCode = 401;
				next(error);
			}

			const { data } = await axios.get(url);
			res.json(data);
		} catch (err) {
			next(err);
		}
	})();
};

exports.saveGoogleRating = (req, res, next) => {
	const fields = ['name', 'rating', 'user_ratings_total', 'url'].join('%2C');
	const placeId = req.body.placeId;
	const url = `https://maps.googleapis.com/maps/api/place/details/json?fields=${fields}&place_id=${placeId}&key=${process.env.API_KEY_GOOGLE}`;

	(async function () {
		try {
			const auth = getIdAndTypeFromAuth(req, res, next);
			if (!auth) {
				const error = new Error('Not Authorized!');
				error.statusCode = 401;
				next(error);
			}
			const { selectedCompany } = auth;
			const company = await Company.findById(selectedCompany);

			const { data } = await axios.get(url);

			const rating = {
				type: 'google',
				rating: data.result.rating,
				ratingCount: data.result.user_ratings_total,
			};
			await updateRatingHandle(company, rating);

			downloadGoogleReviewsHandle(selectedCompany, data.name);
			res.json(rating);
		} catch (err) {
			next(err);
		}
	})();
};

exports.loadGoogleReviews = (req, res, next) => {
	(async function () {
		try {
			const name = req.body.name;
			const url = `https://www.google.com/search?q=${name}`;

			const auth = getIdAndTypeFromAuth(req, res, next);
			if (!auth) {
				const error = new Error('Not Authorized!');
				error.statusCode = 401;
				next(error);
			}
			const { selectedCompany } = auth;

			const items = await downloadGoogleReviewsHandle(selectedCompany, url, true);

			res.json({
					count: items.length,
					data: items,
			});
		} catch (err) {
			next(err);
		}
	})();
};

const downloadGoogleReviewsHandle = async (selectedCompany, url, load) => {
	const company = await Company.findById(selectedCompany);

	if (!load) {
		await changeDownloadingState(company, 'google', true);
	}

	const page = await usePuppeteer(url);
	await page.waitForNetworkIdle();

	await page.click('a[data-async-trigger=reviewDialog]');

	const scrollableDiv = 'div.review-dialog-list';

	let previous = 0;

	const loadMore = async () => {
		await page.waitForNetworkIdle();

		const scrollHeight = await page.evaluate((selector) => {
			const scrollableSection = document.querySelector(selector);

			scrollableSection.scrollTop = scrollableSection.scrollHeight;
			return scrollableSection.scrollHeight;
		}, scrollableDiv);

		if (previous !== scrollHeight) {
			previous = scrollHeight;
			await loadMore();
		}
	};

	await loadMore();

	const result = await page.content();
	const $ = cheerio.load(result);

	const items = [];
	await $('div[class*=__google-review]').map((index, el) => {
		const $el = cheerio.load(el);

		$el.prototype.count = function (selector) {
			return this.find(selector).length;
		};
		const object = {
			company: selectedCompany,
			type: 'google',
			name: $el('div>div>div>div>a').text(),
			rating: Number($el('g-review-stars span').attr('aria-label').split(' ')[1]),
			description: $el('.review-snippet').text().trim(),
			date: reverseFromNow($el('span.dehysf').text()),
		};

		items.push(object);
	});

	if (!load) {
		await Rating.insertMany(items);
		await changeDownloadingState(company, 'google', false);
	}

	return items;
};
