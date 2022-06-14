const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const dayjs = require('dayjs')
const stripe = require('../utils/stripe')
const User = require('../models/user')
const Company = require('../models/company')
const InvitationSettings = require('../models/invitationSettings')
const { confirmEmail, forgotPassword } = require('../utils/mailer')

function slugify(text) {
  return (
    text
      .toString() // Cast to string
      .toLowerCase() // Convert the string to lowercase letters
      .normalize('NFD') // The normalize() method returns the Unicode Normalization Form of a given string.
      .trim() // Remove whitespace from both sides of a string
      .replace(/\s+/g, '-') // Replace spaces with -
      // eslint-disable-next-line no-useless-escape
      .replace(/[^\w\-]+/g, '') // Remove all non-word chars
      // eslint-disable-next-line no-useless-escape
      .replace(/\-\-+/g, '-')
  ) // Replace multiple - with single -
}

exports.getCurrentUser = async (req, res, next) => {
  try {
    const { id } = req.auth

    const currentUser = await User.findById(id)
    await currentUser.populate('selectedCompany')
    await currentUser.populate('companies', '_id name')
    res.status(200).json({
      data: currentUser,
    })
  } catch (err) {
    next(err)
  }
}

exports.updateEmail = async (req, res, next) => {
  try {
    const { id } = req.auth

    const { newEmail, password } = req.body
    const loginUser = await User.findById(id)

    if (!loginUser) {
      const error = new Error('User not found!')
      error.statusCode = 404
      return next(error)
    }

    const validPassword = await bcrypt.compare(password, loginUser.password)

    if (!validPassword) {
      const error = new Error('Password is not valid!')
      error.statusCode = 401
      return next(error)
    }

    loginUser.email = newEmail
    const savedUser = await loginUser.save()

    await savedUser.populate('selectedCompany')
    await savedUser.populate('companies', '_id name')
    res.status(200).json({
      data: savedUser,
      message: 'Successful changed email!',
    })
  } catch (err) {
    next(err)
  }
}

exports.updatePassword = async (req, res, next) => {
  try {
    const { id } = req.auth

    const { newPassword, password } = req.body
    const loginUser = await User.findById(id)

    if (!loginUser) {
      const error = new Error('User not found!')
      error.statusCode = 404
      return next(error)
    }

    const validPassword = await bcrypt.compare(password, loginUser.password)

    if (!validPassword) {
      const error = new Error('Password is not valid!')
      error.statusCode = 401
      return next(error)
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12)

    loginUser.password = hashedPassword
    const savedUser = await loginUser.save()

    await savedUser.populate('selectedCompany')
    await savedUser.populate('companies', '_id name')
    res.status(200).json({
      data: savedUser,
      message: 'Successful changed password!',
    })
  } catch (err) {
    next(err)
  }
}

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body
    const loginUser = await User.findOne({ email })

    const validPassword = await bcrypt.compare(password, loginUser.password)

    if (!validPassword) {
      const error = new Error('Password is not valid!')
      error.statusCode = 401
      return next(error)
    }

    if (!loginUser.confirmed) {
      const error = new Error('User is not confirmed!')
      error.statusCode = 401
      return next(error)
    }

    const token = jwt.sign(
      {
        id: loginUser._id,
        type: loginUser.type,
        selectedCompany: loginUser.selectedCompany,
      },
      process.env.DECODE_KEY,
      {
        // expiresIn: "1h",
      }
    )

    await loginUser.populate('selectedCompany')
    await loginUser.populate('companies', '_id name')
    res.status(200).json({
      token,
      data: loginUser,
      message: 'Successful login!',
    })
  } catch (err) {
    next(err)
  }
}

exports.confirmEmail = async (req, res, next) => {
  try {
    const { id } = req.body
    const user = await User.findById(id)

    user.confirmed = true
    await user.save()

    res.status(200).json({
      message: 'Successful confirmed email!',
    })
  } catch (err) {
    next(err)
  }
}

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body
    const user = await User.findOne({ email })

    if (!user) {
      const error = new Error('User not found!')
      error.statusCode = 404
      return next(error)
    }

    await forgotPassword({
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    })

    res.status(200).json({
      message: 'Email for reset password sent!',
    })
  } catch (err) {
    next(err)
  }
}

exports.resetPassword = async (req, res, next) => {
  try {
    const { id, password } = req.body
    const user = await User.findById(id)

    if (!user) {
      const error = new Error('User not found!')
      error.statusCode = 404
      next(error)
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    user.password = hashedPassword
    await user.save()

    res.status(200).json({
      message: 'Successfully reseted password!',
    })
  } catch (err) {
    next(err)
  }
}

exports.googleLogin = async (req, res, next) => {
  try {
    const { email } = req.body
    const loginUser = await User.findOne({ email })

    if (!loginUser.confirmed) {
      loginUser.confirmed = true
      await loginUser.save()
    }

    const token = jwt.sign(
      {
        id: loginUser._id,
        type: loginUser.type,
        selectedCompany: loginUser.selectedCompany,
      },
      process.env.DECODE_KEY,
      {
        // expiresIn: "1h",
      }
    )

    await loginUser.populate('selectedCompany')
    await loginUser.populate('companies', '_id name')
    res.status(200).json({
      token,
      data: loginUser,
      message: 'Successful login!',
    })
  } catch (err) {
    next(err)
  }
}

exports.register = async (req, res, next) => {
  try {
    const { password, firstName, lastName, email } = req.body

    const userObject = new User({
      firstName,
      lastName,
      email,
      password,
    })

    const userCreated = await userObject.save()

    if (!password) {
      await confirmEmail({
        id: userObject._id,
        firstName,
        lastName,
        email,
      })
    }

    if (userCreated) {
      res.status(200).json({
        message: 'Successfully signed up!',
        data: { id: userObject._id },
      })
    }
  } catch (err) {
    next(err)
  }
}

exports.getWelcome = async (req, res, next) => {
  try {
    const { id } = req.params
    const userObject = await User.findById(id)

    res.status(200).json({
      google: userObject.password === 'google',
    })
  } catch (err) {
    next(err)
  }
}

exports.postWelcome = async (req, res, next) => {
  try {
    const { id, password, companyName, websiteURL } = req.body

    let slug = slugify(companyName)

    const hasSlug = await Company.findOne({ slug })
    if (hasSlug) {
      slug = slug + '-' + Math.floor(1000 + Math.random() * 9000)
    }

    const userObject = await User.findById(id)
    let hashedPassword

    if (userObject.password === 'google') {
      hashedPassword = 'google'
    } else hashedPassword = await bcrypt.hash(password, 12)

    const customer = await stripe.customers.create({
      name: companyName,
    })
    const companyObject = new Company({
      user: userObject._id,
      name: companyName,
      stripeId: customer.id,
      slug,
      websiteURL,
      ratings: [
        { type: 'overall', rating: null, ratingCount: 0 },
        { type: 'trustbucket', rating: null, ratingCount: 0 },
      ],
      subscription: {
        plan: 'trial',
        ends: dayjs().add(7, 'day'),
      },
    })
    const invitationSettingsObject = new InvitationSettings({
      company: companyObject._id,
      senderName: companyName,
      replyTo: userObject.email,
    })

    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        password: hashedPassword,
        selectedCompany: companyObject._id,
        companies: [companyObject._id],
        confirmed: true
      },
      { new: true }
    )
    const companyCreated = await companyObject.save()
    await invitationSettingsObject.save()

    const token = jwt.sign(
      {
        id: userObject._id,
        type: userObject.type,
        selectedCompany: companyObject._id,
      },
      process.env.DECODE_KEY,
      {
        // expiresIn: "1h",
      }
    )

    // await welcomeEmail({
    //   email: userObject.email,
    // })
    await updatedUser.populate('selectedCompany')
    await updatedUser.populate('companies', '_id name')
    if (companyCreated) {
      res.status(200).json({
        message: 'Successfully created company!',
        token,
        data: updatedUser,
      })
    }
  } catch (err) {
    next(err)
  }
}

exports.deactivateAccount = async (req, res, next) => {
  try {
    const { id } = req.auth

    await User.findByIdAndUpdate(id, {
      deactivated: true,
    })

    res.status(200).json({
      message: 'Successfully deactivated account!',
    })
  } catch (err) {
    next(err)
  }
}
