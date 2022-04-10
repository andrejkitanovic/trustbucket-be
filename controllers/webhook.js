const { stripe } = require('../utils/stripe');
const Company = require('../models/company');
const endpointSecret = process.env.STRIPE_SECRET_KEY;

exports.webhook = async (req, res, next) => {
	let event = req.body;

	if (endpointSecret) {
		const signature = req.headers['stripe-signature'];
		console.log(signature)
		try {
			event = stripe.webhooks.constructEvent(req.body, signature, endpointSecret);
		} catch (err) {
			console.log(`⚠️ Webhook signature verification failed.`, err.message);
			return res.sendStatus(400);
		}
	}

	// Handle the event
	switch (event.type) {
		case 'payment_intent.succeeded':
			const payment = event.data.object;

			const { customer } = payment;

			const company = await Company.findOne({ stripeId: customer });
			console.log(company);

			// Then define and call a method to handle the successful payment intent.
			// handlePaymentIntentSucceeded(paymentIntent);
			break;
		case 'payment_method.attached':
			const paymentMethod = event.data.object;
			// Then define and call a method to handle the successful attachment of a PaymentMethod.
			// handlePaymentMethodAttached(paymentMethod);
			break;
		default:
			// Unexpected event type
			console.log(`Unhandled event type ${event.type}.`);
	}

	// Return a 200 res to acknowledge receipt of the event
	res.send();
};
