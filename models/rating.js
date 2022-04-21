const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ratingSchema = new Schema({
	company: {
		type: Schema.Types.ObjectID,
		ref: 'Company',
	},
	type: {
		type: String,
		enum: ['trustbucket', 'google', 'airbnb', 'booking', 'fresha', 'recose', 'bokadirekt', 'hitta', 'trustpilot'],
		default: 'trustbucket',
	},
	url: String,
	name: {
		type: String,
		required: true,
	},
	image: String,
	rating: {
		type: Number,
		required: true,
	},
	title: String,
	description: String,
	date: {
		type: Date,
		required: true,
	},
	reply: {
		text: String,
	},
	verified: {
		type: Boolean,
		default: false,
	},
	email: String
});

module.exports = mongoose.model('Rating', ratingSchema);
