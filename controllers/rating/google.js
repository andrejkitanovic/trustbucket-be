const axios = require('axios');
const cheerio = require('cheerio');
const { usePuppeteer, decreaseCluster } = require('../../utils/puppeteer');

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
				name: data.result.name,
				rating: data.result.rating,
				ratingCount: data.result.user_ratings_total,
			};
			await updateRatingHandle(company, rating);

			downloadGoogleReviewsHandle(selectedCompany, data.result.url);
			res.json(rating);
		} catch (err) {
			next(err);
		}
	})();
};

exports.loadGoogleReviews = (req, res, next) => {
	(async function () {
		try {
			const url = req.body.url;

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
	let company, page;
	try {
		if (!load) {
			company = await Company.findById(selectedCompany);
			await changeDownloadingState(company, 'google', true);
		}

		page = await usePuppeteer(url, { disableInterceptors: true });

		await page.waitForNetworkIdle();
		await page.click('button[jsaction*=moreReviews]');

		const scrollableDiv = 'div.section-scrollbox';

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
		await $('div[data-review-id].gm2-body-2').map((index, el) => {
			const $el = cheerio.load(el);

			$el.prototype.count = function (selector) {
				return this.find(selector).length;
			};
			const object = {
				company: selectedCompany,
				type: 'google',
				name: $el('a[target=_blank]>div:first-child>span').text(),
				rating: Number($el(el).count('img[class*=active]')),
				description: $el('span[jsan*=-text]').text().trim(),
				date: reverseFromNow($el('span[class*=-date]').text()),
			};

			items.push(object);
		});

		if (!load) {
			await Rating.insertMany(items);
		}

		return items;
	} catch (err) {
		console.log(err);
	} finally {
		if (!load && company) {
			company = await Company.findById(selectedCompany);
			await changeDownloadingState(company, 'google', false);
		}
		if (page) {
			await page.close();
			await decreaseCluster();
		}
	}
};
