const { body } = require('express-validator');
const validation = require('../../helpers/validation');
const Rating = require('../../models/rating');
const UncofirmedRating = require('../../models/unconfirmedRating');
const Company = require('../../models/company');

exports.postTrustbucketReviews = [
  body('email', 'email is required')
    .notEmpty()
    .isEmail()
    .normalizeEmail()
    .withMessage('email is not valid')
    .custom(async (value, { req }) => {
      const { slug } = req.body;

      const company = await Company.findOne({
        slug: {
          $regex: new RegExp(slug, 'i'),
        },
      });

      const rating = await Rating.findOne({ company, email: value });
      const uncofirmedRating = await UncofirmedRating.findOne({ company, email: value });

      if (Boolean(rating) || Boolean(uncofirmedRating)) {
        throw new Error('you already reviewed this company');
      }

      return true;
    }),
  validation,
];
