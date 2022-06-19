const jwt = require('jsonwebtoken')
const User = require('../models/user')
const Company = require('../models/company')

exports.postToken = async (req, res, next) => {
  try {
    const { username, password } = req.query;
    console.log(req.query);

    const token = jwt.sign(
      {
        username,
        password,
      },
      process.env.DECODE_KEY,
      {
        // expiresIn: "1h",
      }
    )

    res.status(200).json({
      access: token,
    })
  } catch (err) {
    next(err)
  }
}

const proCompanies = {
  trustbucket_tier1: '3',
  trustbucket_tier2: '10',
  trustbucket_tier3: '30',
  trustbucket_tier4: 'unlimited',
}

exports.postNotification = async (req, res, next) => {
  try {
    if (!req.headers || !req.headers.authorization) {
      throw new Error('Missing Authorization!')
    }
    console.log(req.query);
    // const authorization = req.headers.authorization.split(' ')[1]
    // const decoded = jwt.verify(authorization, process.env.DECODE_KEY)
    // const { username: authUsername, password: authPassword } = decoded

    const { action, plan_id, uuid, activation_email, invoice_item_uuid } =
      req.query
    const availableProCompanies = proCompanies[plan_id]
    console.log('UUID: ', uuid)
    console.log('Invoice Item UUID: ', invoice_item_uuid)

    if (action === 'activate') {
      const userObject = new User({
        firstName: 'AppSumo',
        lastName: 'User',
        email: activation_email,
        password: 'appsumo',
        appsumoId: uuid,
        availableProCompanies,
      })
      const userCreated = await userObject.save()

      res.status(201).json({
        message: 'product activated',
        redirect_url: `https://admin.trustbucket.io/login?a=${userCreated._id}&source=appsumo`,
      })
    } else if (action === 'enhance_tier') {
      await User.findOneAndUpdate(
        { email: activation_email },
        {
          availableProCompanies,
        }
      )

      const userObject = await User.findOne({ email: activation_email })
      const userCompanies = await Company.find({ user: userObject._id })

      if (availableProCompanies === 'unlimited') {
        userCompanies.forEach(async (company) => {
          company.subscription.plan = 'pro'
          await company.save()
        })
      } else {
        const numberOfAvailable = parseInt(availableProCompanies)
        const proCompanies = userCompanies.splice(0, numberOfAvailable)

        proCompanies.forEach(async (company) => {
          company.subscription.plan = 'pro'
          await company.save()
        })

        userCompanies.forEach(async (company) => {
          company.subscription.plan = 'free'
          await company.save()
        })
      }

      res.status(200).json({
        message: 'product enhanced',
      })
    } else if (action === 'reduce_tier') {
      await User.findOneAndUpdate(
        { email: activation_email },
        {
          availableProCompanies,
        }
      )

      const userObject = await User.findOne({ email: activation_email })
      const userCompanies = await Company.find({ user: userObject._id })

      const numberOfAvailable = parseInt(availableProCompanies)
      userCompanies.splice(0, numberOfAvailable)

      userCompanies.forEach(async (company) => {
        company.subscription.plan = 'free'
        await company.save()
      })

      res.status(200).json({
        message: 'product reduced',
      })
    } else if (action === 'refund') {
      await User.findOneAndUpdate(
        { email: activation_email },
        {
          availableProCompanies: '0',
        }
      )

      const userObject = await User.findOne({ email: activation_email })
      const userCompanies = await Company.find({ user: userObject._id })

      userCompanies.forEach(async (company) => {
        company.subscription.plan = 'free'
        await company.save()
      })

      res.status(200).json({
        message: 'product refunded',
      })
    } else if (action === 'update') {
      res.status(200).json({
        message: 'product updated',
      })
    } else throw new Error('Invalid action type')
  } catch (err) {
    next(err)
  }
}
