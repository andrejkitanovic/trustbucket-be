// const stripe = require('stripe')(process.env.STRIPE_PUBLISH_KEY);
// const endpointSecret = process.env.STRIPE_SECRET_KEY;
const Company = require('../models/company');

exports.webhook = async (req, res, next) => {
	// console.log('Webhook called', req.body);
	let event = req.body;

	// Only verify the event if you have an endpoint secret defined.
	// Otherwise use the basic event deserialized with JSON.parse
	// if (endpointSecret) {
	// 	// Get the signature sent by Stripe
	// 	const signature = req.headers['stripe-signature'];
	// 	try {
	// 		event = stripe.webhooks.constructEvent(req.body, signature, endpointSecret);
	// 	} catch (err) {
	// 		console.log(`⚠️ Webhook signature verification failed.`, err.message);
	// 		return res.sendStatus(400);
	// 	}
	// }

	// Handle the event
	switch (event.type) {
		case 'invoice.paid':
			const payment = event.data.object;

			const company = await Company.findOne({ stripeId: payment.customer });
			if (!company) return;

			company.billingInfo.interval = payment.lines.data[0].plan.interval;
			// company.billingInfo.card =

			await company.save();

			break;
		default:
			// Unexpected event type
			console.log(`Unhandled event type ${event.type}.`);
	}

	// Return a 200 res to acknowledge receipt of the event
	res.send();
};
