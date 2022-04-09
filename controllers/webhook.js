const stripe = require('stripe')(process.env.STRIPE_PUBLISH_KEY);
const endpointSecret = process.env.STRIPE_SECRET_KEY;

exports.webhook = (req, res, next) => {
	let event = req.body;
	// Only verify the event if you have an endpoint secret defined.
	// Otherwise use the basic event deserialized with JSON.parse
	if (endpointSecret) {
		// Get the signature sent by Stripe
		const signature = req.headers['stripe-signature'];
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
