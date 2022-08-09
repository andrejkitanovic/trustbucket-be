const mongoose = require('mongoose')

const { Schema } = mongoose

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
  color: {
    type: String,
  },
  logo: {
    type: String,
  },
})

module.exports = mongoose.model('Invitation Setting', invitationSettingsSchema)
