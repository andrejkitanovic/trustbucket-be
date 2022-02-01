const axios = require('axios');
const cheerio = require('cheerio');
const usePuppeteer = require('../../helpers/puppeteer');
const dayjs = require('dayjs');

const { getIdAndTypeFromAuth } = require('../auth');
const { updateRatingHandle } = require('../profile');
const Company = require('../../models/company');

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
	const fields = ['name', 'rating', 'review', 'user_ratings_total', 'url'].join('%2C');
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
				url: data.url,
			};
			await updateRatingHandle(company, rating);

			res.json(rating);
		} catch (err) {
			next(err);
		}
	})();
};

exports.loadGoogleReviews = (req, res, next) => {
	const url = req.body.url;
	// const url = 'https://maps.google.com/?cid=9335875924644060651'

	(async function () {
		try {
			if (!url || !url.includes('maps.google.com/')) {
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
	console.log('start');

	const page = await usePuppeteer(url);
	await page.waitForNetworkIdle();
	await page.click('button[aria-label*=reviews]');

	const scrollableDiv = 'div.section-scrollbox';


	const loadMore = async () => {
		await page.waitForNetworkIdle();
		await page.evaluate((selector) => {
			const scrollableSection = document.querySelector(selector);


			// scrollableSection.scrollTop = scrollableSection.offsetHeight;
			scrollableSection.scrollTop = 1_000_000;
		}, scrollableDiv);

		loadMore();
	};

	await loadMore();
	console.log('finish');

	// 	await page.waitForNetworkIdle();

	// 	const loadMore = async () => {
	// 		await page.click('.modal-content button.view-all-reviews');
	// 		await page.waitForNetworkIdle();

	// 		if (await page.$('.modal-content button.view-all-reviews')) {
	// 			await loadMore();
	// 		}
	// 	};
	// 	if (await page.$('.modal-content button.view-all-reviews')) {
	// 		await loadMore();
	// 	}

	// 	const result = await page.content();

	// 	const $ = cheerio.load(result);

	// 	const items = [];
	// 	await $('.modal-content div[itemprop=review]').map((index, el) => {
	// 		const $el = cheerio.load(el);

	// 		const imageSrc = $el('div.review-user img').attr('src');
	// 		const image = isAbsoluteURL(imageSrc) ? imageSrc : 'https://www.bokadirekt.se' + imageSrc;

	// 		const object = {
	// 			company: selectedCompany,
	// 			type: 'bokadirekt',
	// 			name: $el('span[itemprop=name]').text(),
	// 			image: image,
	// 			rating: Number($el('meta[itemprop=ratingValue]').attr('content')),
	// 			description: $el('div.review-text').text(),
	// 			date: dayjs($el('time[datetime]').attr('datetime'), 'YYYY-MM-DD'),
	// 		};

	// 		items.push(object);
	// 	});

	// 	if (!load) {
	// 		await Rating.insertMany(items);
	// 	}

	// 	return items;
};
