const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ratingSchema = new Schema({
	company: {
		type: Schema.Types.ObjectID,
		ref: 'Company',
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
});

module.exports = mongoose.model('Rating', ratingSchema);
