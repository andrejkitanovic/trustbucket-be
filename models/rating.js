const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ratingSchema = new Schema({
	user: {
		type: Schema.Types.ObjectID,
		ref: 'User',
	},
	type: {
		type: String,
		enum: ['trustbucket', 'google', 'facebook', 'tripadvisor', 'reco.se', 'trustpilot'],
		default: 'trustbucket',
	},
	reviewer: {
		type: String,
		required: true,
	},
	rating: {
		type: Number,
		required: true,
	},
	description: {
		type: String,
	},
});

module.exports = mongoose.model('Rating', ratingSchema);
