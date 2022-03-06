const cheerio = require('cheerio');

const { useRp } = require('../../utils/request-promise');
const { getIdAndTypeFromAuth } = require('../auth');
const { updateRatingHandle } = require('../profile');
const { getCluster } = require('../../utils/puppeteer');

const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

exports.searchAirbnbProfile = (req, res, next) => {
	const { q: url } = req.query;

	(async function () {
		try {
			if (!url || !url.includes('airbnb')) {
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

			const browser = await puppeteer.launch();
			const page = await browser.newPage();
			await page.goto(url);
			await page.waitForNetworkIdle();
			const result = await page.content();

			const $ = cheerio.load(result);
			await browser.close();

			const object = {
				title: $('h1').text(),
				image: $('img#FMP-target').attr('src'),
				address: $('div[data-plugin-in-point-id=TITLE_DEFAULT] button[type=button] span').text(),
				link: url,
			};

			res.json(object);
		} catch (err) {
			next(err);
		}
	})();
};

exports.saveAirbnbProfile = (req, res, next) => {
	const url = req.body.url;

	(async function () {
		try {
			if (!url || !url.includes('airbnb')) {
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

			// const result = await useRp(url);
			// const $ = cheerio.load(result);
			// const json = await JSON.parse($('script[type="application/ld+json"]').html());

			const rating = {
				type: 'airbnb',
				// rating: Number(json[0].aggregateRating.ratingValue),
				// ratingCount: Number(json[0].aggregateRating.reviewCount),
				url,
			};
			// await updateRatingHandle(selectedCompany, rating);
			const cluster = await getCluster();
			await cluster.queue({
				url: url,
				type: 'airbnb',
				selectedCompany,
			});

			res.json(rating);
		} catch (err) {
			next(err);
		}
	})();
};
