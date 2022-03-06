const cheerio = require('cheerio');

const { useRp } = require('../../utils/request-promise');
const { getIdAndTypeFromAuth } = require('../auth');
const { updateRatingHandle } = require('../profile');
const { getCluster, options } = require('../../utils/puppeteer');

const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

exports.searchAirbnbProfile = (req, res, next) => {
	const { q: url } = req.query;

	(async function () {
		try {
			if (!url || !url.includes('www.airbnb.com/rooms')) {
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

			const browser = await puppeteer.launch(options);
			const page = await browser.newPage();
			await page.goto(url);
			await page.waitForNetworkIdle();
			const result = await page.content();

			const $ = cheerio.load(result);
			await browser.close();

			const button = $('button[aria-label*=Rated]').attr('aria-label');

			const object = {
				title: $('h1').text(),
				image: $('img#FMP-target').attr('src'),
				rating: button.split(' ')[1],
				ratingCount: button.split(' ')[6],
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
			if (!url || !url.includes('www.airbnb.com/')) {
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

			const browser = await puppeteer.launch(options);
			const page = await browser.newPage();
			await page.goto(url);
			await page.waitForNetworkIdle();
			const result = await page.content();

			const $ = cheerio.load(result);
			await browser.close();

			const button = $('button[aria-label*=Rated]').attr('aria-label');

			const rating = {
				type: 'airbnb',
				rating: Number(button.split(' ')[1]),
				ratingCount: Number(button.split(' ')[6]),
				url,
			};
			await updateRatingHandle(selectedCompany, rating);
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
