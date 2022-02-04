const puppeteer = require('puppeteer');

let blockedResourceTypes = ['image', 'stylesheet', 'font'];
let blockedNetworks = ['analytics', 'hotjar'];

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
		'--disable-popup-blocking',
		'--disable-print-preview',
		'--disable-prompt-on-repost',
		'--disable-renderer-backgrounding',
		'--disable-setuid-sandbox',
		'--disable-speech-api',
		'--disable-sync',
		'--hide-scrollbars',
		'--ignore-gpu-blacklist',
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
		'--user-agent="Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36"',
	],
};

module.exports = async (url, opts) => {
	const browser = await puppeteer.launch(options);
	const page = await browser.newPage();

	if (opts && opts.enableResource && opts.enableResource.length) {
		blockedResourceTypes = blockedResourceTypes.filter((resource) => !opts.enableResource.includes(resource));
	}

	page.setRequestInterception(true);
	page.on('request', (req) => {
		try {
			if (blockedResourceTypes.some((type) => req.resourceType() === type)) {
				req.abort();
			} else {
				const url = req.url();

				if (blockedNetworks.some((domain) => url.includes(domain))) {
					req.abort();
				} else req.continue();
			}
		} catch (err) {
			console.log(err);
		}
	});

	await page.goto(url);

	return page;
};
