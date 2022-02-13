const axios = require('axios');
const cheerio = require('cheerio');
const { usePuppeteer, decreaseCluster } = require('../../utils/puppeteer');

const { removeAfter } = require('../../helpers/utils');
const { reverseFromNow } = require('../../utils/dayjs');
const { getIdAndTypeFromAuth } = require('../auth');
const { addAddress } = require('../company');
const { updateRatingHandle, changeDownloadingState } = require('../profile');
const Company = require('../../models/company');
const Rating = require('../../models/rating');

exports.getGoogleProfile = (req, res, next) => {
	(async function () {
		try {
			const fields = ['formatted_address', 'name', 'place_id', 'icon_background_color', 'rating', 'geometry'].join(
				'%2C'
			);
			const textquery = req.query.q;
			const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?fields=${fields}&input=${textquery}&inputtype=textquery&key=${process.env.API_KEY_GOOGLE}`;

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
	(async function () {
		try {
			const fields = ['name', 'rating', 'user_ratings_total', 'url', 'formatted_address', 'geometry'].join('%2C');
			const placeId = req.body.placeId;
			const url = `https://maps.googleapis.com/maps/api/place/details/json?fields=${fields}&place_id=${placeId}&key=${process.env.API_KEY_GOOGLE}`;

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
			await addAddress(
				{ name: data.result.formatted_address, position: data.result.geometry.location },
				selectedCompany
			);

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
		console.log('Google fetching URL: ' + url);

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

			console.log('Google scrolling previous: ' + previous + ' current: ' + scrollHeight);

			if (previous !== scrollHeight) {
				previous = scrollHeight;
				await loadMore();
			}
		};

		await loadMore();

		await page.evaluate(() => {
			const expand = document.querySelectorAll('button[jsaction="pane.review.expandReview"]');

			if (expand.length) {
				expand.forEach((el) => el.click());
			}
		});

		const result = await page.content();
		const $ = cheerio.load(result);

		const items = [];
		await $('div[data-review-id].gm2-body-2').map((index, el) => {
			const $el = cheerio.load(el);

			$el.prototype.count = function (selector) {
				return this.find(selector).length;
			};
			$el.prototype.exists = function (selector) {
				return this.find(selector).length > 0;
			};
			const object = {
				company: selectedCompany,
				type: 'google',
				name: $el('a[target=_blank]>div:first-child>span').text(),
				description: removeAfter($el('span[jsan*=-text]').text().trim(), '(Original)'),
				date: reverseFromNow($el('span[class*=-date]').text().trim()),
			};

			if (Number($el(el).count('img[class*=active]'))) {
				object.rating = Number($el(el).count('img[class*=active]'));
			} else {
				object.rating = Number($el('span[class*=RGxYjb]').text().charAt(0));
			}

			if ($el(el).exists('span[class*=-header] > span[class*=-text]') && $el('span[class*=-header] > span[class*=-text]').text().trim()) {
				object.reply = { text: removeAfter($el('span[class*=-header] > span[class*=-text]').text().trim(), '(Original)') };
			}

			if (object.date) {
				items.push(object);
			}
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
