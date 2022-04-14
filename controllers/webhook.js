// const stripe = require('../utils/stripe')
// const endpointSecret = process.env.STRIPE_SECRET_KEY;
const { products } = require('./company');
const Company = require('../models/company');

const parsedProducts = {};
Object.keys(products).forEach((type) =>
	Object.keys(products[type]).forEach(
		(product) =>
			(parsedProducts[products[type][product]] = {
				type,
				product,
			})
	)
);

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

	const payment = event.data.object;

	const company = await Company.findOne({ stripeId: payment.customer });
	if (!company) return;

	switch (event.type) {
		case 'payment_intent.succeeded':
			const { charges } = payment;
			company.billingInfo.card = {
				provider: charges.data[0].payment_method_details.card.brand,
				last4digits: charges.data[0].payment_method_details.card.last4,
				expires:
					charges.data[0].payment_method_details.card.exp_month +
					' / ' +
					charges.data[0].payment_method_details.card.exp_year,
			};
			await company.save();

			break;
		case 'invoice.paid':
			company.billingInfo.interval = payment.lines.data[0].plan.interval;
			company.subscription.plan = parsedProducts[payment.lines.data[0].plan.id].product;
			company.subscription.ends = (payment.lines.data[0].period.ends + 86400) * 1000;

			await company.save();

			break;
		default:
			// Unexpected event type
			console.log(`Unhandled event type ${event.type}.`);
	}

	// Return a 200 res to acknowledge receipt of the event
	res.send();
};
