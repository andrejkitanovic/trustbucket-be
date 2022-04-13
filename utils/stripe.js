const stripe = require('stripe')(process.env.STRIPE_PUBLISH_KEY);

module.exports = stripe;
