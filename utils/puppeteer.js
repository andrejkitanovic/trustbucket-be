const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())

const options = {
	// headless: false,
	args: [
		'--no-sandbox',
		'--disable-setuid-sandbox',
		// '--disable-infobars',
		// '--window-position=0,0',
		// '--ignore-certifcate-errors',
		// '--ignore-certifcate-errors-spki-list',
		// '--user-agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3312.0 Safari/537.36"',
	],
};

module.exports = async (url) => {
	const browser = await puppeteer.launch(options);
	const page = await browser.newPage();
	await page.goto(url);

	return page;
};
