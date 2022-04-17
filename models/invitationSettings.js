const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const invitationSettingsSchema = new Schema({
	company: {
		type: Schema.Types.ObjectID,
		ref: 'Company',
	},
	senderName: {
		type: String,
		required: true,
	},
	replyTo: {
		type: String,
		required: true,
	},
});

module.exports = mongoose.model('Invitation Setting', invitationSettingsSchema);
