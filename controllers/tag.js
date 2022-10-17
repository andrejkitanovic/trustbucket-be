const Rating = require('../models/rating')
const Tag = require('../models/tag')

exports.getTags = async (req, res, next) => {
  try {
    const { selectedCompany } = req.auth

    const tags = await Tag.find({ company: selectedCompany })
    const count = await Tag.countDocuments({ company: selectedCompany })

    res.status(200).json({
      data: tags,
      total: count,
    })
  } catch (err) {
    next(err)
  }
}

exports.postTag = async (req, res, next) => {
  try {
    const { selectedCompany } = req.auth
    const { keyword, autopopulate } = req.body

    const tagCreated = await Tag.create({
      company: selectedCompany,
      keyword,
      autopopulate,
    })

    if (autopopulate) {
      const ratings = await Rating.find({ company: selectedCompany })

      ratings.forEach(async (rating) => {
        const { title, description } = rating
        if (
          title.toLowerCase().includes(keyword.toLowerCase()) ||
          description.toLowerCase().includes(keyword.toLowerCase())
        ) {
          await Rating.findByIdAndUpdate(rating._id, {
            $addToSet: { tags: tagCreated._id },
          })
        }
      })
    }

    res.status(200).json({
      message: 'Tag created!',
    })
  } catch (err) {
    next(err)
  }
}

exports.deleteTag = async (req, res, next) => {
  try {
    const { selectedCompany } = req.auth

    const tagDeleted = await Tag.findOneAndDelete({
      company: selectedCompany,
      _id: req.params.id,
    })

    if (!tagDeleted) {
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
