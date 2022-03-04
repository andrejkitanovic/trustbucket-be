const { Cluster } = require('puppeteer-cluster');
const cheerio = require('cheerio');
const dayjs = require('dayjs');

// HELPERS:
const { removeAfter } = require('../helpers/utils');
const { reverseFromNow } = require('./dayjs');

// CONTROLLERS:
const { changeDownloadingState } = require('../controllers/profile');
const Company = require('../models/company');
const Rating = require('../models/rating');

// let blockedResourceTypes = ['image', 'stylesheet', 'font'];
// let blockedNetworks = ['analytics', 'hotjar'];
const options = {
	// headless: false,
	args: [
		'--autoplay-policy=user-gesture-required',
		'--disable-background-networking',
		'--disable-background-timer-throttling',
		'--disable-backgrounding-occluded-windows',
		'--disable-breakpad',
		'--disable-client-side-phishing-detection',
		'--disable-component-update',
		'--disable-default-apps',
		'--disable-dev-shm-usage',
		'--disable-domain-reliability',
		'--disable-extensions',
		'--disable-features=AudioServiceOutOfProcess',
		'--disable-hang-monitor',
		'--disable-ipc-flooding-protection',
		'--disable-notifications',
		'--disable-offer-store-unmasked-wallet-cards',
		'--disable-print-preview',
		'--disable-prompt-on-repost',
		'--disable-renderer-backgrounding',
		'--disable-setuid-sandbox',
		'--disable-speech-api',
		'--disable-sync',
		'--disable-gpu',
		'--hide-scrollbars',
		'--metrics-recording-only',
		'--mute-audio',
		'--no-default-browser-check',
		'--no-first-run',
		'--no-pings',
		'--no-sandbox',
		'--no-zygote',
		'--password-store=basic',
		'--use-gl=swiftshader',
		'--use-mock-keychain',
		'--disable-accelerated-2d-canvas',
		'--user-agent="Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36"',
	],
	// devtools:true
};

let cluster;
exports.getCluster = async () => {
	if (!cluster) {
		cluster = await Cluster.launch({
			concurrency: Cluster.CONCURRENCY_CONTEXT,
			maxConcurrency: 1,
			puppeteerOptions: options,
		});
	}

	await cluster.task(async ({ page, data }) => {
		const { url, type, selectedCompany } = data;
		company = await Company.findById(selectedCompany);
		await changeDownloadingState(company, type, true);

		console.log('[N/A] Cluster Fetching [' + type + '] Reviews From URL: ' + url);

		await page.goto(url);

		let items;
		switch (type) {
			case 'google':
				items = await getGoogleReviews({
					page,
					url,
					selectedCompany,
				});
				break;
			case 'bokadirekt':
				items = await getBokadirektReviews({
					page,
					url,
					selectedCompany,
				});
				break;
			default:
				break;
		}
		items = items.filter((item) => item.name && item.rating && item.date);
		await Rating.insertMany(items);

		await changeDownloadingState(company, type, false);
	});

	return cluster;
};

const getGoogleReviews = async ({ page, url, selectedCompany }) => {
	try {
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
				url,
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

			if ($el(el).exists('div[class*=-text]') && $el('div[class*=-text]').text().trim()) {
				object.reply = { text: removeAfter($el('div[class*=-text]').text().trim(), '(Original)') };
			}

			if (object.date) {
				items.push(object);
			}
		});

		return items;
	} catch (err) {
		console.log(err);
		return [];
	}
};

const getBokadirektReviews = async ({ page, url, selectedCompany }) => {
	try {
		await page.click('button.view-all-reviews');
		await page.waitForNetworkIdle();

		const loadMore = async () => {
			await page.click('.modal-content button.view-all-reviews');
			await page.waitForNetworkIdle();

			if (await page.$('.modal-content button.view-all-reviews')) {
				await loadMore();
			}
		};
		if (await page.$('.modal-content button.view-all-reviews')) {
			await loadMore();
		}

		const result = await page.content();

		const $ = cheerio.load(result);

		const items = [];
		await $('.modal-content div[itemprop=review]').map((index, el) => {
			const $el = cheerio.load(el);

			const object = {
				company: selectedCompany,
				type: 'bokadirekt',
				url,
				name: $el('span[itemprop=name]').text(),
				rating: Number($el('meta[itemprop=ratingValue]').attr('content')),
				description: $el('div.review-text').text(),
				date: dayjs($el('time[datetime]').attr('datetime'), 'YYYY-MM-DD'),
			};

			items.push(object);
		});

		return items;
	} catch (err) {
		console.log(err);
		return [];
	}
};
