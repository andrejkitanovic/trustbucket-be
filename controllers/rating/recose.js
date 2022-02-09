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

		let processNum = 1;

		const loadMore = async () => {
			processNum++;
			console.log('RECO Load More ' + processNum + ' Timeout: ' + Math.ceil(processNum / 30) * 5000);

			await page.click('a.more-reviews-button');
			try {
				await page.waitForSelector('a.more-reviews-button', { timeout: Math.ceil(processNum / 30) * 5000 });
				await loadMore();
			} catch (err) {}
		};
		if (await page.$('a.more-reviews-button')) {
			await loadMore();
		}
		await page.waitForNetworkIdle();
		console.log('Done with awaiting');

		const result = await page.content();
		const $ = cheerio.load(result);

		const items = [];
		await $('.review-card').map((index, el) => {
			console.log('RECO Review Cards');
			const $el = cheerio.load(el);

			$el.prototype.count = function (selector) {
				return this.find(selector).length;
			};
			const object = {
				company: selectedCompany,
				type: 'recose',
				name: $el('.review-card--reviewer-person-info a').text(),
				rating: Number($el('div.reco-rating.rxs.iblock').count('span')),
				description: $el('div.text-clamp--inner').text().trim(),
				date: dayjs($el('.submit-date').text(), 'YYYY-MM-DD'),
			};

			items.push(object);
		});

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
