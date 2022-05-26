const AutomaticCollection = require('../models/automaticCollection')
const Company = require('../models/company')

exports.getAutomaticCollection = async (req, res, next) => {
  try {
    const { selectedCompany } = req.auth

    const automaticCollection = await AutomaticCollection.find({
      company: selectedCompany,
    })

    res.status(200).json({
      data: automaticCollection,
    })
  } catch (err) {
    next(err)
  }
}

exports.postAutomaticCollection = async (req, res, next) => {
  try {
    const { selectedCompany } = req.auth
    const { template, delay } = req.body

    if (await AutomaticCollection.exists({ company: selectedCompany })) {
      await AutomaticCollection.findOneAndUpdate(
        { company: selectedCompany },
        {
          template,
          delay,
        }
      )
    } else {
      const company = await Company.findById(selectedCompany)
      await AutomaticCollection.create({
        company: selectedCompany,
        slug: company.slug,
        template,
        delay,
      })
    }

    res.status(200).json({
      message: 'Successfully created!',
    })
  } catch (err) {
    next(err)
  }
}
