const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const emailTemplateSchema = new Schema({
	company: {
		type: Schema.Types.ObjectID,
		ref: 'Company',
	},
	name: {
		type: String,
		required: true,
	},
	subject: {
		type: String,
		required: true,
	},
	content: {
		type: String,
		required: true,
	},
	linkUrl: String,
});

module.exports = mongoose.model('Email Template', emailTemplateSchema);
