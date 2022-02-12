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
	description: {
		type: String,
	},
	date: {
		type: Date,
		required: true,
	},
	reply: {
		text: {
			type: String,
		},
	},
});

module.exports = mongoose.model('Rating', ratingSchema);
