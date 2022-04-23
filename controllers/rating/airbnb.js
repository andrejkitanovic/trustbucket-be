const cheerio = require('cheerio')

const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
const { updateRatingHandle } = require('../profile')
const { getCluster, options } = require('../../utils/puppeteer')

puppeteer.use(StealthPlugin())

exports.searchAirbnbProfile = async (req, res, next) => {
  const { q: url } = req.query

  try {
    if (!url || !url.includes('www.airbnb.com/rooms')) {
      const error = new Error('Not Valid URL!')
      error.statusCode = 422
      next(error)
    }

    const browser = await puppeteer.launch(options)
    const page = await browser.newPage()
    await page.goto(url)
    await page.waitForNetworkIdle()
    const result = await page.content()

    const $ = cheerio.load(result)
    await browser.close()

    const button = $('button[aria-label*=Rated]').attr('aria-label')

    const object = {
      title: $('h1').text(),
      image: $('img#FMP-target').attr('src'),
      rating: button.split(' ')[1],
      ratingCount: button.split(' ')[6],
      address: $(
        'div[data-plugin-in-point-id=TITLE_DEFAULT] button[type=button] span'
      ).text(),
      link: url,
    }

    res.json(object)
  } catch (err) {
    next(err)
  }
}

exports.saveAirbnbProfile = async (req, res, next) => {
  const { url } = req.body

  try {
    if (!url || !url.includes('www.airbnb.com/')) {
      const error = new Error('Not Valid URL!')
      error.statusCode = 422
      next(error)
    }

    const { selectedCompany } = req.auth

    const browser = await puppeteer.launch(options)
    const page = await browser.newPage()
    await page.goto(url)
    await page.waitForNetworkIdle()
    const result = await page.content()

    const $ = cheerio.load(result)
    await browser.close()

    const button = $('button[aria-label*=Rated]').attr('aria-label')

    const rating = {
      type: 'airbnb',
      rating: Number(button.split(' ')[1]),
      ratingCount: Number(button.split(' ')[6]),
      url,
    }
    await updateRatingHandle(selectedCompany, rating)
    const cluster = await getCluster()
    await cluster.queue({
      url,
      type: 'airbnb',
      selectedCompany,
    })

    res.json(rating)
  } catch (err) {
    next(err)
  }
}
