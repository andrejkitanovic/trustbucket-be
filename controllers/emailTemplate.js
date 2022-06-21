const EmailTemplate = require('../models/emailTemplate')
const Company = require('../models/company')

const defaultEmailTemplates = (companyName, slug) => [
  {
    _id: 'default-trustbucket-review',
    content: `<h3>Hi {firstName}</h3>
    <p style="height: 15px;"></p>
    <p>How was your experience with us at {companyName}?</p>
    <p style="height: 15px;"></p>
    <p>We truly appreciate every customer's opinion and would love to hear all about your experience.</p>
    <p style="height: 15px;"></p>
    <p>Thank you,</p>
    <p>{firstNameofUser} at {companyName}</p>
    <p style="height: 15px;"></p>
    <p>{review_link: Click here to submit your review}</p>`,
    linkUrl: `https://reviews.trustbucket.io/write-review/${slug}?campaignId={campaignId}&name={firstName}%20{lastName}&email={email}`,
    name: 'Review us on Trustbucket',
    subject: `How was your experience with ${companyName}`,
    default: true,
  },
]

exports.getEmailTemplates = async (req, res, next) => {
  try {
    const { selectedCompany } = req.auth

    const company = await Company.findById(selectedCompany)

    const emailTemplates = await EmailTemplate.find({
      company: selectedCompany,
    }).select('name subject content linkUrl')
    const count = await EmailTemplate.countDocuments({
      company: selectedCompany,
    })

    res.status(200).json({
      total: count,
      data: [
        ...emailTemplates,
        ...defaultEmailTemplates(company.name, company.slug),
      ],
    })
  } catch (err) {
    next(err)
  }
}

exports.postEmailTemplate = async (req, res, next) => {
  try {
    const { selectedCompany } = req.auth

    await EmailTemplate.create({ company: selectedCompany, ...req.body })

    res.status(200).json({
      message: 'Successfully created!',
    })
  } catch (err) {
    next(err)
  }
}

exports.updateEmailTemplate = async (req, res, next) => {
  try {
    const { selectedCompany } = req.auth

    const emailUpdated = await EmailTemplate.findOneAndUpdate(
      {
        company: selectedCompany,
        _id: req.query.id,
      },
      {
        ...req.body,
      }
    )

    if (!emailUpdated) {
      const error = new Error('Not Found!')
      error.statusCode = 404
      next(error)
    }

    res.status(200).json({
      message: 'Successfully updated!',
    })
  } catch (err) {
    next(err)
  }
}

exports.deleteEmailTemplate = async (req, res, next) => {
  try {
    const { selectedCompany } = req.auth

    const emailDeleted = await EmailTemplate.findOneAndDelete({
      company: selectedCompany,
      _id: req.query.id,
    })

    if (!emailDeleted) {
      const error = new Error('Not Found!')
      error.statusCode = 404
      next(error)
    }

    res.status(200).json({
      message: 'Successfully deleted!',
    })
  } catch (err) {
    next(err)
  }
}

exports.defaultEmailTemplates = defaultEmailTemplates
