const puppeteer = require('puppeteer');

const options = {
	headless: false,
	args: ['--no-sandbox', '--disable-setuid-sandbox'],
};

module.exports = async (url) => {
	const browser = await puppeteer.launch(options);
	const page = await browser.newPage();
	await page.goto(url);

    return page
};
