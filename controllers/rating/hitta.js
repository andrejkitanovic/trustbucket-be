const cheerio = require('cheerio')

const { useRp } = require('../../utils/request-promise')
const { updateRatingHandle, deleteRatingHandle } = require('../profile')
const { getCluster } = require('../../utils/puppeteer')

exports.searchHittaProfile = async (req, res, next) => {
  const { q: url } = req.body

  try {
    if (!url || !url.includes('hitta.se/')) {
      const error = new Error('Not Valid URL!')
      error.statusCode = 422
      next(error)
    }

    const result = await useRp(url)

    const $ = cheerio.load(result)
    const json = await JSON.parse(
      $('script[type="application/ld+json"]').html()
    )

    const object = {
      title: json.name,
      image: json.logo,
      address: json.address && json.address.streetAddress,
      link: url,
    }

    res.json(object)
  } catch (err) {
    next(err)
  }
}

exports.saveHittaProfile = async (req, res, next) => {
  const { url } = req.body

  try {
    if (!url || !url.includes('hitta.se/')) {
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
      type: 'hitta',
      name: json.name,
      rating: json.aggregateRating.ratingValue,
      ratingCount: json.aggregateRating.ratingCount,
      url,
    }
    await updateRatingHandle(selectedCompany, rating)
    const cluster = await getCluster()
    await cluster.queue({
      url,
      type: 'hitta',
      selectedCompany,
    })

    res.json(rating)
  } catch (err) {
    next(err)
  }
}

exports.cronHittaProfile = async (url, selectedCompany, previousRatings) => {
  try {
    // if (!url || !url.includes('hitta.se/')) {
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
      type: 'hitta',
      name: json.name,
      rating: json.aggregateRating.ratingValue,
      ratingCount: json.aggregateRating.ratingCount,
      url,
    }
    if (previousRatings < rating.ratingCount) {
      await deleteRatingHandle(selectedCompany, 'hitta')
      await updateRatingHandle(selectedCompany, rating)
      const cluster = await getCluster()
      await cluster.queue({
        url,
        type: 'hitta',
        selectedCompany,
      })

      console.log(rating)
    } else console.log('Same hitta reviews as previous')
  } catch (err) {
    console.log(err)
  }
}
