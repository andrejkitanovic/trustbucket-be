const { body } = require('express-validator')
const validation = require('../helpers/validation')
const User = require('../models/user')
// const Company = require('../models/company')

exports.updateEmail = [
  body('newEmail', 'email is required')
    .notEmpty()
    .isEmail()
    .normalizeEmail()
    .withMessage('email is not valid')
    .custom(async (value) => {
      const userExists = await User.findOne({ email: value })

      if (userExists) {
        throw new Error('email is in use')
      }

      return true
    }),
  body('password', 'password is required')
    .not()
    .isEmpty()
    .isLength({ min: 3 })
    .withMessage('password must be longer then 3 characters'),
  validation,
]

exports.updatePassword = [
  body('newPassword', 'new password is required')
    .not()
    .isEmpty()
    .isLength({ min: 3 })
    .withMessage('new Password must be longer then 3 characters'),
  body('password', 'password is required')
    .not()
    .isEmpty()
    .isLength({ min: 3 })
    .withMessage('password must be longer then 3 characters'),
  validation,
]

exports.login = [
  body('email', 'email is required')
    .notEmpty()
    .isEmail()
    .normalizeEmail()
    .withMessage('email is not valid')
    .custom(async (value) => {
      const user = await User.findOne({ email: value })

      if (!user) {
        throw new Error('user not found')
      } else if (user.deactivated) {
        throw new Error('user is deactivated')
      }

      return true
    }),
  body('password', 'password is required')
    .not()
    .isEmpty()
    .isLength({ min: 3 })
    .withMessage('password must be longer then 3 characters'),
  validation,
]

exports.forgotPassword = [
  body('email', 'email is required')
    .notEmpty()
    .isEmail()
    .normalizeEmail()
    .withMessage('email is not valid'),
  validation,
]

exports.resetPassword = [
  body('id'),
  body('password').isLength({ min: 3 }),
  validation,
]

exports.register = [
  body('firstName', 'first name is required').notEmpty(),
  body('lastName', 'last name is required').notEmpty(),
  body('email', 'email is required')
    .notEmpty()
    .isEmail()
    .normalizeEmail()
    .withMessage('email is not valid')
    .custom(async (value) => {
      const userExists = await User.findOne({ email: value })

      if (userExists) {
        throw new Error('email is in use')
      }

      return true
    }),
  validation,
]

exports.googleLogin = [
  body('email', 'email is required')
    .notEmpty()
    .isEmail()
    .normalizeEmail()
    .withMessage('email is not valid')
    .custom(async (value) => {
      const user = await User.findOne({ email: value })

      if (!user) {
        throw new Error('user not found')
      } else if (user.deactivated) {
        throw new Error('user is deactivated')
      }

      return true
    }),
  validation,
]
