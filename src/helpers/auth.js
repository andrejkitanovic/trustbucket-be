const jwt = require('jsonwebtoken')
const User = require('../models/user')
const Company = require('../models/company')

const auth = async (req, res, next) => {
  try {
    if (req.headers && req.headers.authorization) {
      const authorization = req.headers.authorization.split(' ')[1]
      const decoded = jwt.verify(authorization, process.env.DECODE_KEY)

      const { id, type } = decoded

      const user = await User.findById(id)
      if (!user) {
        return res.status(403).json({ message: 'User not found!' })
      }
      if (user.deactivated) {
        return res.status(403).json({ message: 'User is deactivated!' })
      }

      req.auth = {
        id,
        type,
        selectedCompany: user.selectedCompany,
      }
    }
  } catch (err) {
    return res.status(403).json({ message: 'Not Authorized' })
  }

  return next()
}

const subscribedAuth = async (req, res, next) => {
  try {
    if (req.headers && req.headers.authorization) {
      const authorization = req.headers.authorization.split(' ')[1]
      const decoded = jwt.verify(authorization, process.env.DECODE_KEY)

      const { id, type } = decoded

      const user = await User.findById(id)
      if (!user) {
        return res.status(403).json({ message: 'User not found!' })
      }
      if (user.deactivated) {
        return res.status(403).json({ message: 'User is deactivated!' })
      }

      const company = await Company.findById(user.selectedCompany)

      if (company.subscription.plan === 'free') {
        return res.status(403).json({
          message:
            'Please renew your subscription you are currently on free plan!',
        })
      }

      req.auth = {
        id,
        type,
        selectedCompany: user.selectedCompany,
      }
    }
  } catch (err) {
    return res.status(403).json({ message: 'Not Authorized' })
  }

  return next()
}

exports.auth = auth
exports.subscribedAuth = subscribedAuth