const schedule = require('node-schedule')
const Company = require('../models/company')

const { cronRecoseProfile } = require('./rating/recose')
const { cronGoogleProfile } = require('./rating/google')
const { cronFreshaProfile } = require('./rating/fresha')
const { cronBokadirektProfile } = require('./rating/bokadirekt')
const { cronBookingProfile } = require('./rating/booking')
const { cronTrustpilotProfile } = require('./rating/trustpilot')
const { cronHittaProfile } = require('./rating/hitta')

schedule.scheduleJob('0 0 0 * * ?', async () => {
    try {
        const allCompanies = await Company.find({
            $or: [
                { 'subscription.plan': 'pro' },
                { 'subscription.plan': 'start' },
                { 'subscription.plan': 'trial' },
            ],
        }).select('ratings')

        for (const company of allCompanies) {
            const id = company._id
            const { ratings } = company

            for (const rating of ratings) {
                switch (rating.type) {
                    case 'recose':
                        await cronRecoseProfile(
                            rating.url,
                            id,
                            rating.ratingCount
                        )
                        break
                    case 'google':
                        await cronGoogleProfile(
                            rating.placeId,
                            id,
                            rating.ratingCount
                        )
                        break
                    case 'fresha':
                        await cronFreshaProfile(
                            rating.url,
                            id,
                            rating.ratingCount
                        )
                        break
                    case 'bokadirekt':
                        await cronBokadirektProfile(
                            rating.url,
                            id,
                            rating.ratingCount
                        )
                        break
                    case 'booking':
                        await cronBookingProfile(
                            rating.url,
                            id,
                            rating.ratingCount
                        )
                        break
                    case 'trustpilot':
                        await cronTrustpilotProfile(
                            rating.url,
                            id,
                            rating.ratingCount
                        )
                        break
                    case 'hitta':
                        await cronHittaProfile(
                            rating.url,
                            id,
                            rating.ratingCount
                        )
                        break
                    default:
                        break
                }
            }
        }
    } catch (err) {
        console.log(err)
    }
})
