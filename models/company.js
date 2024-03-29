const mongoose = require('mongoose')

const { Schema } = mongoose

const companySchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectID,
      ref: 'User',
    },
    image: {
      type: String,
    },
    name: {
      type: String,
      required: true,
    },
    websiteURL: {
      type: String,
      required: true,
    },
    email: String,
    phone: String,
    address: {
      name: String,
      position: {
        lat: Number,
        lng: Number,
      },
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    socialLinks: [
      {
        media: {
          type: String,
          enum: ['facebook', 'instagram', 'twitter', 'youtube', 'tiktok'],
        },
        url: {
          type: String,
        },
      },
    ],
    stripeId: String,
    billingInfo: {
      nextPlanInterval: String,
      interval: String,
      card: {
        provider: String,
        last4digits: String,
        expires: String,
      },
      vatNumber: String,
      address: String,
      email: String,
    },
    subscription: {
      id: {
        type: String,
      },
      plan: {
        type: String,
        enum: ['trial', 'free', 'start', 'pro'],
        default: 'free',
      },
      nextPlan: {
        type: String,
        enum: ['trial', 'free', 'start', 'pro'],
        default: 'free',
      },
      ends: {
        type: Date,
      },
    },
    reviewsPageLanguage: {
      type: String,
      default: 'en',
    },
    ratings: [
      {
        refreshToken: String,
        route: String,
        placeId: {
          type: String,
        },
        googleId: {
          type: String
        },
        type: {
          type: String,
          enum: [
            'overall',
            'trustbucket',
            'google',
            'airbnb',
            'booking',
            'fresha',
            'recose',
            'bokadirekt',
            'trustpilot',
            'hitta',
            'yelp'
          ],
          default: 'overall',
        },
        rating: {
          type: Number,
          set(v) {
            if (v !== null && v !== undefined) {
              return v.toLocaleString('en-US', {
                maximumFractionDigits: 1,
              })
            }
            return 0
          },
        },
        name: {
          type: String,
        },
        downloading: {
          type: Boolean,
          default: false,
        },
        ratingCount: {
          type: Number,
          default: 0,
        },
        url: {
          type: String,
        },
      },
    ],
  },
  { timestamps: true }
)

module.exports = mongoose.model('Company', companySchema)
