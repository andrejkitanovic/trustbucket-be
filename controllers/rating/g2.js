const cheerio = require('cheerio')

const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
const { updateRatingHandle } = require('../profile')
const { getG2Reviews, options } = require('../../utils/puppeteer')
const { changeDownloadingState } = require('../../controllers/profile')
const Rating = require('../../models/rating')

puppeteer.use(StealthPlugin())

exports.searchG2Profile = async (req, res, next) => {
  const { q: url } = req.body

  try {
    if (!url || !url.includes('g2.com/products/')) {
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

    const title = $('[itemprop=itemReviewed]').attr('content')
    const image = $('[itemprop=image]').attr('src')
    const address =
      $('[itemprop=addressLocality]').text() +
      ',' +
      $('[itemprop=addressRegion]').text() +
      $('[itemprop=postalCode]').text()

    const object = {
      title,
      image,
      address,
      link: url,
    }

    res.json(object)
  } catch (err) {
    next(err)
  }
}

exports.saveG2Profile = async (req, res, next) => {
  const { url } = req.body

  try {
    if (!url || !url.includes('g2.com/products/')) {
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
    // await browser.close()

    const ratingValue = Number($('[itemprop=ratingValue]').attr('content'))
    const ratingCount = Number($('[itemprop=reviewCount]').attr('content'))

    const rating = {
      type: 'g2',
      rating: ratingValue,
      ratingCount,
      url,
    }
    await updateRatingHandle(selectedCompany, rating)

    await changeDownloadingState(selectedCompany, 'g2', true)
    let items = await getG2Reviews({
      page,
      url,
      selectedCompany,
    })
    if (items.length) {
        console.log(`LOADED REVIEWS:${items.length}`)
        items = items.filter((item) => item.name && item.rating && item.date)
        console.log(`VALID REVIEWS:${items.length}`)
  
        await Rating.insertMany(items)
  
        await changeDownloadingState(selectedCompany, 'g2', false)
      } else {
        await changeDownloadingState(selectedCompany, 'g2', false)
      }

    res.json(rating)
  } catch (err) {
    next(err)
  }
}
