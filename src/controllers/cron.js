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
            await cronRecoseProfile(rating.url, id, rating.ratingCount)
            break
          case 'google':
            if (rating.refreshToken) {
              await cronGoogleProfile(
                rating.refreshToken,
                rating.route,
                rating.url,
                rating.name,
                rating.placeId,
                id,
                rating.ratingCount
              )
            }
            break
          case 'fresha':
            await cronFreshaProfile(rating.url, id, rating.ratingCount)
            break
          case 'bokadirekt':
            await cronBokadirektProfile(rating.url, id, rating.ratingCount)
            break
          case 'booking':
            await cronBookingProfile(rating.url, id, rating.ratingCount)
            break
          case 'trustpilot':
            await cronTrustpilotProfile(rating.url, id, rating.ratingCount)
            break
          case 'hitta':
            await cronHittaProfile(rating.url, id, rating.ratingCount)
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

schedule.scheduleJob('0 0 0 * * ?', async () => {
  try {
    const companies = await Company.find({
      'subscription.ends': { $lt: new Date() },
      'subscription.plan': ['trial', 'start', 'pro'],
    })

    console.log(companies.length + ' company reverted to free plan')

    companies.forEach(async (company) => {
      if (company.subscription.ends !== null) {
        company.subscription.plan = 'free'
        company.subscription.nextPlan = 'free'
        company.subscription.ends = null

        company.billingInfo.interval = null
        company.billingInfo.nextPlanInterval = null

        await company.save()
      }
    })
  } catch (err) {
    console.log(err)
  }
})
