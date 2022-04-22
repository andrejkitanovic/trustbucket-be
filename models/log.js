const mongoose = require('mongoose');

const { Schema } = mongoose;

const logSchema = new Schema({
  method: {
    type: String,
    enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    required: true,
  },
  ip: String,
  location: {
    country: String,
    city: String,
  },
  endpoint: {
    type: String,
    required: true,
  },
  status: {
    type: Number,
    length: 3,
    required: true,
  },
  authenticated: {
    type: Boolean,
    required: true,
  },
  user: {
    type: Schema.Types.ObjectID,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

logSchema.index({ createdAt: 1 }, { expireAfterSeconds: 604800 });

module.exports = mongoose.model('Log', logSchema);
