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

// exports.deleteUser = async (req, res, next) => {
//   try {
//     const userId = req.query.id;

//     const userDeleted = await User.deleteOne({ _id: userId });
//     const companies = await Company.find({ user: userId });

//     res.status(200).json({
//       message: 'User successfully deleted!',
//     });
//   } catch (err) {
//     next(err);
//   }
// };
