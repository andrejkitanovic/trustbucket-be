const cheerio = require('cheerio');
const { usePuppeteer } = require('../../utils/puppeteer');

const { getIdAndTypeFromAuth } = require('../auth');
const { updateRatingHandle } = require('../profile');
const Company = require('../../models/company');

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

			const page = await usePuppeteer(url);

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
			const { selectedCompany } = auth;
			const company = await Company.findById(selectedCompany);

			const page = await usePuppeteer(url);

			const result = await page.content();
			const $ = cheerio.load(result);
			const json = await JSON.parse($('script[type="application/ld+json"]').html());

			const rating = {
				type: 'trustpilot',
				rating: Number(json[0].aggregateRating.ratingValue),
				ratingCount: Number(json[0].aggregateRating.reviewCount),
				url,
			};
			await updateRatingHandle(company, rating);

			res.json(rating);
		} catch (err) {
			next(err);
		}
	})();
};

exports.loadTrustpilotReviews = (req, res, next) => {
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
			const { selectedCompany } = auth;

			const items = await downloadTrustpilotReviewsHandle(selectedCompany, url, true);

			res.json({
				count: items.length,
				data: items,
			});
		} catch (err) {
			next(err);
		}
	})();
};

const downloadTrustpilotReviewsHandle = async (selectedCompany, url, load) => {
	let company, page;
	try {
		if (!load) {
			company = await Company.findById(selectedCompany);
			await changeDownloadingState(company, 'trustpilot', true);
		}

		page = await usePuppeteer(url);

		await page.click('a[name=show-all-reviews]');
		await page.waitForNetworkIdle();

		const items = [];
		let result = await page.content();

		const loadReviews = async (items, result) => {
			const $ = cheerio.load(result);

			await $('article[class*=reviewCard]').map((index, el) => {
				const $el = cheerio.load(el);
				// const date = $el('.c-review-block__right .c-review-block__date').text().replace('Reviewed:', '').trim();

				// let format = '';
				// if (dayjs(date, 'MMMM D, YYYY').isValid()) {
				// 	format = 'MMMM D, YYYY';
				// } else if (dayjs(date, 'D MMMM YYYY').isValid()) {
				// 	format = 'D MMMM YYYY';
				// } else if (dayjs(date, 'D. MMMM YYYY.').isValid()) {
				// 	format = 'D. MMMM YYYY.';
				// }
				const object = {
					company: selectedCompany,
					type: 'trustpilot',
					name: $el('div[data-consumer-name-typography]').text(),
					// rating: Number($el('.bui-review-score__badge').text().trim().replace(',', '.')) / 2,
					// description: $el('.c-review__body').text().trim(),
					// date: dayjs(date, format),
				};
				items.push(object);
			});
		};

		await loadReviews(items, result);

		const loadMore = async () => {
			console.log('TRUSTPILOT Load More');
			await page.click('a[name=pagination-button-next]');
			await page.waitForNetworkIdle();

			result = await page.content();
			await loadReviews(items, result);

			if (await page.$('a[name=pagination-button-next]')) {
				await loadMore();
			}
		};
		if (await page.$('a[name=pagination-button-next]')) {
			await loadMore();
		}

		if (!load) {
			await Rating.insertMany(items);
		}
		console.log('TRUSTPILOT Review Cards', items.length);
		return items;
	} catch (err) {
		console.log(err);
		// if (page) {
		// 	await page.screenshot({ path: './uploads/debug.png' });
		// }
	} finally {
		if (!load && company) {
			company = await Company.findById(selectedCompany);
			await changeDownloadingState(company, 'trustpilot', false);
		}
		if (page) {
			await page.close();
		}
	}
};
