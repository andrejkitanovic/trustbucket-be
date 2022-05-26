const mongoose = require('mongoose')

const { Schema } = mongoose

const automaticCollectionSchema = new Schema({
  company: {
    type: Schema.Types.ObjectID,
    ref: 'Company',
  },
  template: {
    type: Schema.Types.ObjectID,
    ref: 'Email Template',
  },
  slug: {
    type: String,
    required: true,
  },
  delay: {
    type: Number,
    required: true,
  },
})

module.exports = mongoose.model(
  'Automatic Collection',
  automaticCollectionSchema
)
