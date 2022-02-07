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
		'--disable-gpu',
		'--hide-scrollbars',
		'--metrics-recording-only',
		'--mute-audio',
		'--no-default-browser-check',
		'--no-first-run',
		'--no-pings',
		'--password-store=basic',
		'--use-gl=swiftshader',
		'--use-mock-keychain',
		'--user-agent="Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36"',
	],
};

let browser;
let cluster = 0;

const increaseCluster = async () => {
	cluster = (await browser.pages()).length - 1;
	console.log('Cluster: ' + cluster);
};

const decreaseCluster = async () => {
	cluster = (await browser.pages()).length - 1;
	console.log('Cluster: ' + cluster);

	if (cluster === 0) {
		browser.close();
		browser = null;
	}
};

const setupInterceptors = (page) => {
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

	page.on('pageerror', function (err) {
		theTempValue = err.toString();
		console.log('Page error: ' + theTempValue);
	});

	page.on('error', function (err) {
		theTempValue = err.toString();
		console.log('Error: ' + theTempValue);
	});

	page.on('close', function (err) {
		decreaseCluster();
	});
};

exports.usePuppeteer = async (url, opts) => {
	if (!browser) {
		browser = await puppeteer.launch(options);
	}
	
	const page = await browser.newPage();
	increaseCluster();

	if (opts) {
		if (opts.enableResource && opts.enableResource.length) {
			blockedResourceTypes = blockedResourceTypes.filter((resource) => !opts.enableResource.includes(resource));
		}
		if (opts.enableNetwork && opts.enableNetwork.length) {
			blockedNetworks = blockedNetworks.filter((network) => !opts.enableNetwork.includes(network));
		}
	}

	if (!opts || !opts.disableInterceptors) {
		setupInterceptors(page);
	}

	await page.goto(url);

	return page;
};

exports.decreaseCluster = decreaseCluster;
