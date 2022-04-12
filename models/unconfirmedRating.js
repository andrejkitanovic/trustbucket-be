const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const uncofirmedRatingSchema = new Schema({
	company: {
		type: Schema.Types.ObjectID,
		ref: 'Company',
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
});

module.exports = mongoose.model('Uncofirmed Rating', uncofirmedRatingSchema);
