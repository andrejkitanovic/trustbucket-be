const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema(
	{
		type: {
			type: String,
			enum: ['basic', 'admin'],
			default: 'basic',
		},
		websiteURL: {
			type: String,
			required: true,
		},
		companyName: {
			type: String,
			required: true,
		},
		firstName: {
			type: String,
			required: true,
		},
		lastName: {
			type: String,
			required: true,
		},
		phone: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
		},
		password: {
			type: String,
			required: true,
		},
		ratings: [
			{
				type: {
					type: String,
					enum: ['overall', 'google'],
					default: 'overall',
				},
				rating: {
					type: Number,
				},
				ratingCount: {
					type: Number,
					default: 0,
				},
			},
		],
	},
	{ timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
