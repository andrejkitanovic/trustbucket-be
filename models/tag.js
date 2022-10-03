const mongoose = require('mongoose')

const { Schema } = mongoose

const tagSchema = new Schema({
    company: {
        type: Schema.Types.ObjectID,
        ref: 'Company',
    },
    keyword: {
        type: String,
        required: true
    },
    autopopulate: {
        type: Boolean,
        default: false,
    }
})

module.exports = mongoose.model('Tag', tagSchema)
