const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const widgetSchema = new Schema(
	{
		company: {
			type: Schema.Types.ObjectID,
			ref: 'Company',
		},
		object: {},
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Widget', widgetSchema);
