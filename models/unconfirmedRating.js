const mongoose = require('mongoose');

const { Schema } = mongoose;

const uncofirmedRatingSchema = new Schema({
  company: {
    type: Schema.Types.ObjectID,
    ref: 'Company',
  },
  url: String,
  name: {
    type: String,
    required: true,
  },
  image: String,
  rating: {
    type: Number,
    required: true,
  },
  title: String,
  description: String,
  date: {
    type: Date,
    required: true,
  },
  email: String,
});

module.exports = mongoose.model('Uncofirmed Rating', uncofirmedRatingSchema);
