const {
  sendEmail,
  getCampaignOverview,
  getRecieversStatstics,
} = require('../utils/mailer')
const { defaultEmailTemplates } = require('./emailTemplate')
const EmailTemplate = require('../models/emailTemplate')
const Campaign = require('../models/campaign')
const Company = require('../models/company')
const User = require('../models/user')
const InvitationSettings = require('../models/invitationSettings')
const dayjs = require('dayjs')

const sentThisMonth = async (selectedCompany) => {
  const allCampaignsOverview = await getCampaignOverview()

  const campaigns = await Campaign.find({ company: selectedCompany })
  const campaignsId = campaigns.map((campaign) => campaign._id.toString())

  const result = allCampaignsOverview.filter((campaign) => {
    const date = dayjs.unix(campaign.SendTimeStart)
    const isThisMonth = dayjs().isSame(date, 'month')

    return isThisMonth && campaignsId.includes(campaign.Title)
  })

  return result.reduce((sum, single) => sum + single.DeliveredCount, 0)
}

exports.getCampaigns = async (req, res, next) => {
  try {
    const { selectedCompany } = req.auth

    const campaigns = await Campaign.find({ company: selectedCompany })
    const count = await Campaign.countDocuments({
      company: selectedCompany,
    })

    res.status(200).json({
      total: count,
      data: campaigns,
    })
  } catch (err) {
    next(err)
  }
}

exports.getSingleCampaign = async (req, res, next) => {
  try {
    const { selectedCompany } = req.auth
    const { id } = req.params

    const campaign = await Campaign.findOne({
      _id: id,
      company: selectedCompany,
    })

    const recievers = await getRecieversStatstics(campaign.recievers)

    res.status(200).json({
      data: campaign,
      recievers,
    })
  } catch (err) {
    next(err)
  }
}

exports.getInvitationsDelivered = async (req, res, next) => {
  try {
    const { selectedCompany } = req.auth

    const campaigns = await Campaign.find({ company: selectedCompany })
    const campaignsId = campaigns.map((campaign) => campaign._id.toString())
    const allCampaignsOverview = await getCampaignOverview()
    const result = allCampaignsOverview.filter((campaign) =>
      campaignsId.includes(campaign.Title)
    )

    const invitationsCount = result.reduce(
      (sum, single) => sum + single.DeliveredCount,
      0
    )

    res.status(200).json({
      invitationsCount,
    })
  } catch (err) {
    next(err)
  }
}

exports.getCampaignStats = async (req, res, next) => {
  try {
    const { selectedCompany } = req.auth

    const campaigns = await Campaign.find({ company: selectedCompany })
    const campaignsId = campaigns.map((campaign) => campaign._id.toString())
    const campaignsEmails = campaigns
      .map((campaign) => campaign.recievers.map((reciever) => reciever.email))
      .flat()

    const allCampaignsOverview = await getCampaignOverview()
    const result = allCampaignsOverview.filter((campaign) =>
      campaignsId.includes(campaign.Title)
    )

    const verifiedReviewsCount = campaigns.reduce(
      (sum, single) => sum + single.verifiedReviews,
      0
    )
    const trustbucketRating =
      campaigns.reduce(
        (sum, single) =>
          sum + single.trustbucketRating * single.verifiedReviews,
        0
      ) / verifiedReviewsCount

    const stats = {
      campaignCount: result.length,
      invitationsCount: result.reduce(
        (sum, single) => sum + single.DeliveredCount,
        0
      ),
      uniqueCustomersCount: [...new Set(campaignsEmails)].length,
      openCount: result.reduce((sum, single) => sum + single.OpenedCount, 0),
      clickCount: result.reduce((sum, single) => sum + single.ClickedCount, 0),
      processCount: result.reduce(
        (sum, single) => sum + single.ProcessedCount,
        0
      ),
      verifiedReviewsCount,
      trustbucketRating,
    }

    res.status(200).json({
      stats,
    })
  } catch (err) {
    next(err)
  }
}

const appsumoLimit = {
  0: 3,
  3: 500,
  10: 750,
  30: 1000,
  unlimited: 2000,
}

exports.postCampaign = async (req, res, next) => {
  try {
    const { id, selectedCompany } = req.auth
    const { templateId, reminder, recievers } = req.body

    const user = await User.findById(id)
    const company = await Company.findById(selectedCompany)

    let limit = null
    if (company.subscription.plan === 'free') {
      limit = 3
    } else if (user.type === 'appsumo') {
      limit = appsumoLimit[user.availableProCompanies]
    }

    const emailsSent = (await sentThisMonth(selectedCompany)) + recievers.length
    console.log('Emails count:', emailsSent)
    if (limit && emailsSent > limit) {
      throw new Error(`Exceeded Limit of ${limit} emails per month`)
    }

    const campaignObject = new Campaign({
      company: selectedCompany,
      reminder,
      recievers,
    })

    let template

    if (templateId.includes('default')) {
      template = defaultEmailTemplates(company.name, company.slug).find(
        (template) => template._id === templateId
      )
    } else {
      template = await EmailTemplate.findById(templateId).select(
        'subject content linkUrl'
      )
      campaignObject.emailTemplate = templateId
    }
    const campaign = await campaignObject.save()

    const invitation = await InvitationSettings.findOne({
      company: selectedCompany,
    })

    await sendEmail(
      template,
      recievers,
      campaign._id,
      invitation,
      company.name,
      user.firstName
    )

    res.status(200).json({
      campaign: campaignObject,
      message: 'Successfully sent!',
    })
  } catch (err) {
    next(err)
  }
}
