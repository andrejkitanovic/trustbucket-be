const cheerio = require('cheerio')

const { useRp } = require('../../utils/request-promise')
const { updateRatingHandle, deleteRatingHandle } = require('../profile')
const { getCluster } = require('../../utils/puppeteer')

exports.searchRecoseProfile = async (req, res, next) => {
  const { q } = req.body
  const url = `https://www.reco.se/sok/s?q=${q}&page=1`

  try {
    const result = await useRp(url)

    const $ = cheerio.load(result)
    const items = []
    await $('div.media.clfx')
      .slice(0, 3)
      .forEach((index, el) => {
        const $el = cheerio.load(el)

        const object = {
          title: $el('a.nou.uh').text(),
          image: `https:${$el('img').attr('data-picture')}`,
          link: `https://www.reco.se${$el('a.nou.uh').attr('href')}`,
        }
        items.push(object)
      })
    if (!items.length) throw new Error('Not Found!')

    res.json(items[0])
  } catch (err) {
    next(err)
  }
}

exports.saveRecoseProfile = async (req, res, next) => {
  const { url } = req.body

  try {
    if (!url || !url.includes('www.reco.se/')) {
      const error = new Error('Not Valid URL!')
      error.statusCode = 422
      next(error)
    }

    const { selectedCompany } = req.auth

    const result = await useRp(url)
    const $ = cheerio.load(result)
    const json = await JSON.parse(
      $('script[type="application/ld+json"]').html()
    )

    const rating = {
      type: 'recose',
      name: json.name,
      rating: json.aggregateRating.ratingValue,
      ratingCount: json.aggregateRating.ratingCount,
      url,
    }
    await updateRatingHandle(selectedCompany, rating)
    const cluster = await getCluster()
    await cluster.queue({
      url,
      type: 'recose',
      selectedCompany,
    })

    res.json(rating)
  } catch (err) {
    next(err)
  }
}

exports.cronRecoseProfile = async (url, selectedCompany, previousRatings) => {
  try {
    // if (!url || !url.includes('www.reco.se/')) {
    //   const error = new Error('Not Valid URL!');
    //   error.statusCode = 422;
    //   next(error);
    // }

    const result = await useRp(url)
    const $ = cheerio.load(result)
    const json = await JSON.parse(
      $('script[type="application/ld+json"]').html()
    )

    const rating = {
      type: 'recose',
      name: json.name,
      rating: json.aggregateRating.ratingValue,
      ratingCount: json.aggregateRating.ratingCount,
      url,
    }

    if (previousRatings < rating.ratingCount) {
      await deleteRatingHandle(selectedCompany, 'recose')
      await updateRatingHandle(selectedCompany, rating)
      const cluster = await getCluster()
      await cluster.queue({
        url,
        type: 'recose',
        selectedCompany,
      })

      console.log(rating)
    } else console.log('Same recose reviews as previous')
  } catch (err) {
    console.log(err)
  }
}
