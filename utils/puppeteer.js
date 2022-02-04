const puppeteer = require('puppeteer');

const options = {
	// headless: false,
	args: [
		'--no-sandbox',
		'--disable-setuid-sandbox',
		'--disable-infobars',
		'--window-position=0,0',
		'--ignore-certifcate-errors',
		'--ignore-certifcate-errors-spki-list',
		'--user-agent="Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36"',
	],
};

module.exports = async (url) => {
	const browser = await puppeteer.launch(options);

	const page = await browser.newPage();
	await page.setExtraHTTPHeaders({
		'user-agent':
			'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36',
		'upgrade-insecure-requests': '1',
		accept:
			'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
		'accept-encoding': 'gzip, deflate, br',
		'accept-language': 'en-US,en;q=0.9,en;q=0.8',
	});
	await page.goto(url);

	return page;
};
