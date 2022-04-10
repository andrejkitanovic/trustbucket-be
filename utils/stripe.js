const stripe = require('stripe')(process.env.STRIPE_PUBLISH_KEY);

exports.stripe = stripe;
