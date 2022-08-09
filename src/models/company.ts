import { Schema, model, Document } from 'mongoose';

interface ICompany extends Document {
	user: string;
	image?: string;
	name: string;
	websiteURL: string;
	email?: string;
	phone?: string;
	address: {
		name: string;
		position: {
			lat: string;
			lng: string;
		};
	};
	slug: string;
	socialLinks: {
		media: string;
		url: string;
	}[];
	stripeId: string;
	billingInfo: {
		nextPlanInterval: string;
		interval: string;
		card: {
			provider: string;
			last4digits: string;
			expires: string;
		};
		vatNumber: string;
		address: string;
		email: string;
	};
	subscription: {
		id: string;
		plan: string;
		nextPlan: string;
		ends: Date;
	};
	reviewsPageLanguage: string;
	ratings: {
		refreshToken: string;
		route: string;
		placeId: string;
		type: string;
		rating: number;
		name: string;
		downloading: boolean;
		ratingCount: number;
		url: string;
	}[];
	createdAt: Date;
}

const companySchema = new Schema(
	{
		user: {
			type: Schema.Types.ObjectId,
			ref: 'User',
		},
		image: {
			type: String,
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
					enum: ['facebook', 'instagram', 'twitter', 'youtube', 'tiktok'],
				},
				url: {
					type: String,
				},
			},
		],
		stripeId: String,
		billingInfo: {
			nextPlanInterval: String,
			interval: String,
			card: {
				provider: String,
				last4digits: String,
				expires: String,
			},
			vatNumber: String,
			address: String,
			email: String,
		},
		subscription: {
			id: {
				type: String,
			},
			plan: {
				type: String,
				enum: ['trial', 'free', 'start', 'pro'],
				default: 'free',
			},
			nextPlan: {
				type: String,
				enum: ['trial', 'free', 'start', 'pro'],
				default: 'free',
			},
			ends: {
				type: Date,
			},
		},
		reviewsPageLanguage: {
			type: String,
			enum: ['en', 'se'],
			default: 'en',
		},
		ratings: [
			{
				refreshToken: String,
				route: String,
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
					set(v: any) {
						if (v !== null && v !== undefined) {
							return v.toLocaleString('en-US', {
								maximumFractionDigits: 1,
							});
						}
						return 0;
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

const objectModel = model<ICompany>('Company', companySchema);

export default objectModel;
