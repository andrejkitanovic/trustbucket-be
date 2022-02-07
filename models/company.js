const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const companySchema = new Schema(
	{
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
		ratings: [
			{
				type: {
					type: String,
					enum: ['overall', 'google', 'booking', 'fresha', 'recose', 'bokadirekt', 'trustpilot'],
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
