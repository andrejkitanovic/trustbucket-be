const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema(
	{
		type: {
			type: String,
			enum: ['basic', 'admin'],
			default: 'basic',
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
		selectedCompany: {
			type: Schema.Types.ObjectID,
			ref: 'Company',
		},
		companies: [
			{
				type: Schema.Types.ObjectID,
				ref: 'Company',
			},
		],
	},
	{ timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
