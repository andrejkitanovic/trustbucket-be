// const rp = require('request-promise');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');

const { getIdAndTypeFromAuth } = require('../auth');
const { updateRatingHandle } = require('../profile');
const User = require('../../models/user');

exports.searchTrustpilotProfile = (req, res, next) => {
	const { q } = req.query;
	const url = `https://www.trustpilot.com/search?query=${q}`;

	(async function () {
		try {
			const auth = getIdAndTypeFromAuth(req, res, next);
			if (!auth) {
				const error = new Error('Not Authorized!');
				error.statusCode = 401;
				next(error);
			}

			const browser = await puppeteer.launch({
				args: ['--no-sandbox', '--disable-setuid-sandbox'],
			});
			const page = await browser.newPage();
			await page.goto(url);

			const result = await page.content();
			const $ = cheerio.load(result);
			const items = [];
			await $('.item')
				.slice(0, 3)
				.map((index, el) => {
					const $el = cheerio.load(el);

					const object = {
						title: $el('.search-result-heading').text(),
						// ratingImage: $el('.star-rating.star-rating--small img').attr('src'),
						link: 'https://www.trustpilot.com' + $el('.search-result-heading').attr('href'),
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

exports.saveTrustpilotProfile = (req, res, next) => {
	const url = req.body.url;

	(async function () {
		try {
			if (!url || !url.includes('www.trustpilot.com/review')) {
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

			const browser = await puppeteer.launch({
				args: ['--no-sandbox', '--disable-setuid-sandbox'],
			});
			const page = await browser.newPage();
			await page.goto(url);

			const result = await page.content();
			const $ = cheerio.load(result);
			const json = await JSON.parse($('script[type="application/ld+json"]').html());

			const rating = {
				type: 'trustpilot',
				rating: Number(json[0].aggregateRating.ratingValue),
				ratingCount: Number(json[0].aggregateRating.reviewCount),
				url,
			};
			await updateRatingHandle(profile, rating);

			res.json(rating);
		} catch (err) {
			next(err);
		}
	})();
};
