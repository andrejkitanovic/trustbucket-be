const cheerio = require('cheerio');

const { useRp } = require('../../utils/request-promise');
const { updateRatingHandle, deleteRatingHandle } = require('../profile');
const { getCluster } = require('../../utils/puppeteer');

exports.searchTrustpilotProfile = async (req, res, next) => {
  const { q: url } = req.body;

  try {
    if (!url || !url.includes('trustpilot.com/review/')) {
      const error = new Error('Not Valid URL!');
      error.statusCode = 422;
      next(error);
    }

    const result = await useRp(url);
    const $ = cheerio.load(result);
    const jsonParse = await JSON.parse($('script[type="application/ld+json"][data-business-unit-json-ld]').html());
    const json = jsonParse['@graph'].find((object) => object['@type'] === 'LocalBusiness');

    const object = {
      title: json.name,
      image: $('img[class*=[styles_image]').attr('src'),
      address: json.address && json.address.streetAddress,
      link: url,
    };

    res.json(object);
  } catch (err) {
    next(err);
  }
};

exports.saveTrustpilotProfile = async (req, res, next) => {
  const { url } = req.body;

  try {
    if (!url || !url.includes('trustpilot.com/review/')) {
      const error = new Error('Not Valid URL!');
      error.statusCode = 422;
      next(error);
    }
    const { selectedCompany } = req.auth;

    const result = await useRp(url);
    const $ = cheerio.load(result);
    const jsonParse = await JSON.parse($('script[type="application/ld+json"][data-business-unit-json-ld]').html());
    const json = jsonParse['@graph'].find((object) => object['@type'] === 'LocalBusiness');

    const rating = {
      type: 'trustpilot',
      name: json.name,
      rating: Number(json.aggregateRating.ratingValue),
      ratingCount: Number(json.aggregateRating.reviewCount),
      url,
    };
    await updateRatingHandle(selectedCompany, rating);
    const cluster = await getCluster();
    await cluster.queue({
      url,
      type: 'trustpilot',
      selectedCompany,
    });

    // downloadTrustpilotReviewsHandle(selectedCompany, url);
    res.json(rating);
  } catch (err) {
    next(err);
  }
};

exports.cronTrustpilotProfile = async (url, selectedCompany, previousRatings) => {
  try {
    // if (!url || !url.includes('trustpilot.com/review/')) {
    //   const error = new Error('Not Valid URL!');
    //   error.statusCode = 422;
    //   next(error);
    // }

    const result = await useRp(url);
    const $ = cheerio.load(result);
    const jsonParse = await JSON.parse($('script[type="application/ld+json"][data-business-unit-json-ld]').html());
    const json = jsonParse['@graph'].find((object) => object['@type'] === 'LocalBusiness');

    const rating = {
      type: 'trustpilot',
      name: json.name,
      rating: Number(json.aggregateRating.ratingValue),
      ratingCount: Number(json.aggregateRating.reviewCount),
      url,
    };

    if (previousRatings < rating.ratingCount) {
      await deleteRatingHandle(selectedCompany, 'trustpilot');
      await updateRatingHandle(selectedCompany, rating);
      const cluster = await getCluster();
      await cluster.queue({
        url,
        type: 'trustpilot',
        selectedCompany,
      });

      console.log(rating);
    } else console.log('Same trustpilot reviews as previous');
  } catch (err) {
    console.log(err);
  }
};
