const cheerio = require('cheerio');

const { useRp } = require('../../utils/request-promise');
const { updateRatingHandle, deleteRatingHandle } = require('../profile');
const { getCluster } = require('../../utils/puppeteer');

exports.searchBokadirektProfile = async (req, res, next) => {
  const { q } = req.body;
  const url = `https://www.bokadirekt.se/${q}/var`;

  try {
    const result = await useRp(url);
    const $ = cheerio.load(result);

    const items = [];
    await $('.card')
      .slice(0, 3)
      .forEach((index, el) => {
        const $el = cheerio.load(el);

        const object = {
          title: $el('.card-title').text(),
          image: $el('.card-image img').attr('src'),
          address: $el('.address').text(),
          link: `https://www.bokadirekt.se${$el(el).attr('href')}`,
        };
        items.push(object);
      });
    if (!items.length) throw new Error('Not Found!');

    res.json(items[0]);
  } catch (err) {
    next(err);
  }
};

exports.saveBokadirektProfile = async (req, res, next) => {
  const { url } = req.body;

  try {
    if (!url || !url.includes('www.bokadirekt.se/places/')) {
      const error = new Error('Not Valid URL!');
      error.statusCode = 422;
      next(error);
    }
    const { selectedCompany } = req.auth;

    const result = await useRp(url);
    const $ = cheerio.load(result);

    const name = $('h1[itemprop=name]').first().text().trim();
    const ratingText = $('span[itemprop=ratingValue]').first().text();
    const ratingCountText = $('span[itemprop=ratingCount]').text();

    const rating = {
      type: 'bokadirekt',
      name,
      rating: ratingText ? Number(ratingText.trim()) : null,
      ratingCount: ratingCountText ? Number(ratingCountText.trim()) : 0,
      url,
    };
    await updateRatingHandle(selectedCompany, rating);
    const cluster = await getCluster();
    await cluster.queue({
      url,
      type: 'bokadirekt',
      selectedCompany,
    });

    // downloadBokadirektReviewsHandle(selectedCompany, url);

    res.json(rating);
  } catch (err) {
    next(err);
  }
};

exports.cronBokadirektProfile = async (url, selectedCompany, previousRatings) => {
  try {
    // if (!url || !url.includes('www.bokadirekt.se/places/')) {
    //   const error = new Error('Not Valid URL!');
    //   error.statusCode = 422;
    //   next(error);
    // }

    const result = await useRp(url);
    const $ = cheerio.load(result);

    const name = $('h1[itemprop=name]').first().text().trim();
    const ratingText = $('span[itemprop=ratingValue]').first().text();
    const ratingCountText = $('span[itemprop=ratingCount]').text();

    const rating = {
      type: 'bokadirekt',
      name,
      rating: ratingText ? Number(ratingText.trim()) : null,
      ratingCount: ratingCountText ? Number(ratingCountText.trim()) : 0,
      url,
    };

    if (previousRatings < rating.ratingCount) {
      await deleteRatingHandle(selectedCompany, 'bokadirekt');
      await updateRatingHandle(selectedCompany, rating);
      const cluster = await getCluster();
      await cluster.queue({
        url,
        type: 'bokadirekt',
        selectedCompany,
      });

      console.log(rating);
    } else console.log('Same bokadirekt reviews as previous');
  } catch (err) {
    console.log(err);
  }
};
