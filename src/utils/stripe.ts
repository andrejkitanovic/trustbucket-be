import Stripe from 'stripe';

const stripeWithKey = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
	apiVersion: '2022-08-01',
});

export default stripeWithKey;
