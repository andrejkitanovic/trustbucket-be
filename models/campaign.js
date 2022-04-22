const mongoose = require('mongoose')

const { Schema } = mongoose

const campaignSchema = new Schema({
    company: {
        type: Schema.Types.ObjectID,
        ref: 'Company',
    },
    emailTemplate: {
        type: Schema.Types.ObjectID,
        ref: 'Email Template',
    },
    reminder: {
        type: Boolean,
        default: false,
    },
    verifiedReviews: {
        type: Number,
        default: 0,
    },
    trustbucketRating: {
        type: Number,
        default: 0,
    },
    recievers: [
        {
            firstName: {
                type: String,
                required: true,
            },
            lastName: {
                type: String,
                required: true,
            },
            email: {
                type: String,
                required: true,
            },
        },
    ],
})

module.exports = mongoose.model('Campaign', campaignSchema)
