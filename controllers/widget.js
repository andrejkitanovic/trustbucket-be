const Widget = require('../models/widget')
const Rating = require('../models/rating')
const Company = require('../models/company')

exports.getWidget = async (req, res, next) => {
  try {
    const { id } = req.query

    const widget = await Widget.findById(id)
    const companyId = widget.selectedCompany

    const company = await Company.findById(companyId)
    if (company.subscription.plan === 'free') {
      res.status(403).json({
        message:
          'Please renew your subscription you are currently on free plan!',
      })
    }

    await widget.populate('selectedCompany')

    const params = {
      company: companyId,
    }
    if (
      widget.object &&
      widget.object.reviewSources &&
      widget.object.reviewSources !== 'all'
    ) {
      params.type = widget.object.reviewSources
    }
    if (
      widget.object &&
      widget.object.tags
    ){
      params.tags = widget.object.tags
    }

    const ratings = await Rating.find({ ...params })
      .sort([['date', -1]])
      .limit(50)

    res.status(200).json({ widget, ratings })
  } catch (err) {
    next(err)
  }
}

exports.postWidget = async (req, res, next) => {
  try {
    const { object, attributes } = req.body

    const { selectedCompany } = req.auth

    const widgetObject = new Widget({
      selectedCompany,
      object,
      attributes,
    })

    const widget = await widgetObject.save()

    const attributesToValues = Object.keys(attributes).map(
      (attribute) => `${attribute}="${attributes[attribute]}"`
    )

    res.status(200).json({
      link: `<iframe ${attributesToValues.join(
        ' '
      )} src="https://admin.trustbucket.io/widget/${widget._id}"></iframe>`,
      message: 'Successfully created!',
    })
  } catch (err) {
    next(err)
  }
}
