import { Schema, model, Document } from 'mongoose';

interface ICampaign extends Document {
	company: string;
	emailTemplate: string;
	reminder: string;
	verifiedReviews: number;
	trustbucketRating: number;
	recievers: {
		firstName: string;
		lastname: string;
		email: string;
	}[];
}

const campaignSchema = new Schema({
	company: {
		type: Schema.Types.ObjectId,
		ref: 'Company',
	},
	emailTemplate: {
		type: Schema.Types.ObjectId,
		ref: 'Email Template',
	},
	reminder: {
		type: Boolean,
		default: false,
	},
	verifiedReviews: {
		type: Number,
		default: 0,
	},
	trustbucketRating: {
		type: Number,
		default: 0,
	},
	recievers: [
		{
			firstName: {
				type: String,
				required: true,
			},
			lastName: {
				type: String,
				required: true,
			},
			email: {
				type: String,
				required: true,
			},
		},
	],
});

const objectModel = model<ICampaign>('Campaign', campaignSchema);

export default objectModel;
