const mongoose = require('mongoose');

const { Schema } = mongoose;

const feedbackSchema = new Schema({
  company: {
    type: Schema.Types.ObjectID,
    ref: 'Company',
  },
  message: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('Feedback', feedbackSchema);
