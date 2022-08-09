const mongoose = require('mongoose')

const { Schema } = mongoose

const userSchema = new Schema(
  {
    confirmed: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      enum: ['basic', 'appsumo', 'admin'],
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
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
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
    deactivated: {
      type: Boolean,
      default: false,
    },
    // App sumo stuff
    availableProCompanies: {
      type: String,
    },
    invioceItemUUID: {
      type: String
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('User', userSchema)
