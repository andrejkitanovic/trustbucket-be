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
	console.log(await browser.version());
	const page = await browser.newPage();
	await page.goto(url);

	return page;
};
