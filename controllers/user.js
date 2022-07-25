const User = require('../models/user')

exports.getUsers = async (req, res, next) => {
  try {
    const { id } = req.auth

    const users = await User.find({ _id: { $ne: id } }).populate('companies')
    const count = await User.countDocuments({ _id: { $ne: id } })

    res.status(200).json({
      total: count,
      data: users,
    })
  } catch (err) {
    next(err)
  }
}

exports.filterUsers = async (req, res, next) => {
  try {
    const { pageNumber, pageSize, sortField, sortOrder } = req.body.queryParams
    const { id } = req.auth

    const users = await User.find({ _id: { $ne: id } })
      .sort([[sortField, sortOrder === 'asc' ? 1 : -1]])
      .skip(Number((pageNumber - 1) * pageSize))
      .limit(Number(pageSize))
      .populate('companies')
    const count = await User.countDocuments({ _id: { $ne: id } })

    res.status(200).json({
      data: users,
      total: count,
    })
  } catch (err) {
    next(err)
  }
}

exports.deleteUser = async (req, res, next) => {
  try {
    const { selectedCompany } = req.auth
    const { id } = req.params

    const user = await User.findById(id)
    if (user.companies.length === 1) {
      await User.findByIdAndDelete(id)
    } else {
      user.companies.filter(
        (company) => company._id.toString() !== selectedCompany
      )
      user.selectedCompany = user.companies[0]

      await user.save()
    }

    res.status(200).json({
      message: 'User successfully deleted!',
    })
  } catch (err) {
    next(err)
  }
}
