const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const companySchema = new Schema(
	{
		image: {
			type: String,
		},
		user: {
			type: Schema.Types.ObjectID,
			ref: 'User',
		},
		name: {
			type: String,
			required: true,
		},
		websiteURL: {
			type: String,
			required: true,
		},
		email: String,
		phone: String,
		address: {
			name: String,
			position: {
				lat: Number,
				lng: Number,
			},
		},
		slug: {
			type: String,
			required: true,
			unique: true,
		},
		socialLinks: [
			{
				media: {
					type: String,
					enum: ['facebook', 'instagram', 'twitter', 'youtube'],
				},
				url: {
					type: String,
				},
			},
		],
		stripeId: String,
		billingInfo: {
			interval: String,
			card: {
				provider: String,
				last4digits: String,
				expires: String
			},
			vatNumber: String,
			address: String,
			email: String,
		},
		subscription: {
			plan: {
				type: String,
				enum: ['trial', 'free', 'start', 'pro'],
				default: 'free',
			},
			ends: {
				type: Date,
			},
		},
		ratings: [
			{
				placeId: {
					type: String,
				},
				type: {
					type: String,
					enum: [
						'overall',
						'trustbucket',
						'google',
						'airbnb',
						'booking',
						'fresha',
						'recose',
						'bokadirekt',
						'trustpilot',
						'hitta',
					],
					default: 'overall',
				},
				rating: {
					type: Number,
					set: function (v) {
						if (v !== null) {
							return v.toLocaleString('en-US', {
								maximumFractionDigits: 1,
							});
						}
					},
				},
				name: {
					type: String,
				},
				downloading: {
					type: Boolean,
					default: false,
				},
				ratingCount: {
					type: Number,
					default: 0,
				},
				url: {
					type: String,
				},
			},
		],
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Company', companySchema);
