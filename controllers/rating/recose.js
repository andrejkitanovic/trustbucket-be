const rp = require('request-promise');
const cheerio = require('cheerio');
const { usePuppeteer } = require('../../utils/puppeteer');
const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');

const { getIdAndTypeFromAuth } = require('../auth');
const { updateRatingHandle, changeDownloadingState } = require('../profile');
const Company = require('../../models/company');
const Rating = require('../../models/rating');

dayjs.extend(customParseFormat);

exports.searchRecoseProfile = (req, res, next) => {
	const { q } = req.query;
	const url = `https://www.reco.se/sok/s?q=${q}&page=1`;

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
			await $('div.media.clfx')
				.slice(0, 3)
				.map((index, el) => {
					const $el = cheerio.load(el);

					const object = {
						title: $el('a.nou.uh').text(),
						image: 'https:' + $el('img').attr('data-picture'),
						link: 'https://www.reco.se' + $el('a.nou.uh').attr('href'),
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

exports.saveRecoseProfile = (req, res, next) => {
	const url = req.body.url;

	(async function () {
		try {
			if (!url || !url.includes('www.reco.se/')) {
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
				type: 'recose',
				name: json.name,
				rating: json.aggregateRating.ratingValue,
				ratingCount: json.aggregateRating.ratingCount,
				url,
			};
			await updateRatingHandle(company, rating);

			downloadRecoseReviewsHandle(selectedCompany, url);
			res.json(rating);
		} catch (err) {
			next(err);
		}
	})();
};

exports.loadRecoseReviews = (req, res, next) => {
	const url = req.body.url;

	(async function () {
		try {
			if (!url || !url.includes('www.reco.se/')) {
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

			const items = await downloadRecoseReviewsHandle(selectedCompany, url, true);

			res.json({
				count: items.length,
				data: items,
			});
		} catch (err) {
			next(err);
		}
	})();
};

const downloadRecoseReviewsHandle = async (selectedCompany, url, load) => {
	let company, page;
	try {
		if (!load) {
			company = await Company.findById(selectedCompany);
			await changeDownloadingState(company, 'recose', true);
		}

		page = await usePuppeteer(url, { enableNetwork: ['analytics'] });

		await page.evaluate(async () => {
			async function waitUntil() {
				return await new Promise((resolve) => {
					let interval = setInterval(() => {
						const button = document.querySelector('a.more-reviews-button');
						if (button) {
							button.click();
						} else {
							resolve();
							clearInterval(interval);
							interval = null;
						}
					}, 50);
				});
			}
			await waitUntil();
		});

		console.log('Done with awaiting');

		const result = await page.content();
		const $ = cheerio.load(result);

		const items = [];
		await $('.review-card').map((index, el) => {
			const $el = cheerio.load(el);

			$el.prototype.count = function (selector) {
				return this.find(selector).length;
			};
			$el.prototype.exists = function (selector) {
				return this.find(selector).length > 0;
			};

			const object = {
				company: selectedCompany,
				type: 'recose',
				url,
				name: $el('.review-card--reviewer-person-info a').text(),
				rating: Number($el('div.reco-rating.rxs.iblock').count('span')),
				description: $el('div.text-clamp--inner q').html(),
				date: dayjs($el('.submit-date').text(), 'YYYY-MM-DD'),
			};

			if ($el(el).exists('.review-card--response')) {
				object.reply = { text: $el('.review-card--response q').html() };
			}

			items.push(object);
		});
		console.log('RECO Review Cards', items.length);

		if (!load) {
			await Rating.insertMany(items);
		}

		return items;
	} catch (err) {
		console.log(err);
		// if (page) {
		// 	await page.screenshot({ path: './uploads/debug.png' });
		// }
	} finally {
		if (!load && company) {
			company = await Company.findById(selectedCompany);
			await changeDownloadingState(company, 'recose', false);
		}
		if (page) {
			await page.close();
		}
	}
};

// ALL DONE
