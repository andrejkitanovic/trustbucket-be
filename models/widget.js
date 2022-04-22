const mongoose = require('mongoose')

const { Schema } = mongoose

const widgetSchema = new Schema(
  {
    selectedCompany: {
      type: Schema.Types.ObjectID,
      ref: 'Company',
    },
    attributes: {},
    object: {},
  },
  { timestamps: true }
)

module.exports = mongoose.model('Widget', widgetSchema)
