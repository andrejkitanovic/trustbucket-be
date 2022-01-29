const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ratingSchema = new Schema({
	user: {
		type: Schema.Types.ObjectID,
		ref: 'User',
	},
	type: {
		type: String,
		enum: ['trustbucket', 'google', 'booking', 'fresha', 'recose', 'bokadirekt', 'trustpilot'],
		default: 'trustbucket',
	},
	name: {
		type: String,
		required: true,
	},
	image: {
		type: String,
	},
	rating: {
		type: Number,
		required: true,
	},
	description: {
		type: String,
	},
	date: {
		type: Date,
	},
});

module.exports = mongoose.model('Rating', ratingSchema);
