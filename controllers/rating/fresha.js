const cheerio = require('cheerio');

const { useRp } = require('../../utils/request-promise');
const { updateRatingHandle, deleteRatingHandle } = require('../profile');
const { getCluster } = require('../../utils/puppeteer');

exports.searchFreshaProfile = async (req, res, next) => {
  const { q: url } = req.body;

  try {
    const result = await useRp(url);
    const $ = cheerio.load(result);
    const json = await JSON.parse($('script[type="application/ld+json"]').html());

    const object = {
      title: json.name,
      image: json.image,
      address: json.address,
      link: url,
    };

    res.json(object);
  } catch (err) {
    next(err);
  }
};

exports.saveFreshaProfile = async (req, res, next) => {
  const { url } = req.body;

  try {
    if (!url || !url.includes('www.fresha.com/')) {
      const error = new Error('Not Valid URL!');
      error.statusCode = 422;
      next(error);
    }

    const { selectedCompany } = req.auth;

    const result = await useRp(url);
    const $ = cheerio.load(result);
    const json = await JSON.parse($('script[type="application/ld+json"]').html());

    const rating = {
      type: 'fresha',
      name: json.name,
      rating: json.aggregateRating.ratingValue,
      ratingCount: json.aggregateRating.reviewCount,
      url,
    };
    await updateRatingHandle(selectedCompany, rating);
    const cluster = await getCluster();
    await cluster.queue({
      url: `${url}/reviews`,
      type: 'fresha',
      selectedCompany,
    });

    res.json(rating);
  } catch (err) {
    next(err);
  }
};

exports.cronFreshaProfile = async (url, selectedCompany, previousRatings) => {
  try {
    // if (!url || !url.includes('www.fresha.com/')) {
    //   const error = new Error('Not Valid URL!');
    //   error.statusCode = 422;
    //   next(error);
    // }

    const result = await useRp(url);
    const $ = cheerio.load(result);
    const json = await JSON.parse($('script[type="application/ld+json"]').html());

    const rating = {
      type: 'fresha',
      name: json.name,
      rating: json.aggregateRating.ratingValue,
      ratingCount: json.aggregateRating.reviewCount,
      url,
    };

    if (previousRatings < rating.ratingCount) {
      await deleteRatingHandle(selectedCompany, 'fresha');
      await updateRatingHandle(selectedCompany, rating);
      const cluster = await getCluster();
      await cluster.queue({
        url: `${url}/reviews`,
        type: 'fresha',
        selectedCompany,
      });

      console.log(rating);
    } else console.log('Same fresha reviews as previous');
  } catch (err) {
    console.log(err);
  }
};
