const mongoose = require('mongoose')

const { Schema } = mongoose

const announcementSchema = new Schema(
  {
    message: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Announcement', announcementSchema)
