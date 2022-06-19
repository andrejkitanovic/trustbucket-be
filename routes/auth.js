const express = require('express')
const authController = require('../controllers/auth')
const authValidation = require('../validation/auth')
const auth = require('../helpers/auth').auth
const defineRoute = require('../helpers/defineRoute')

const router = express.Router()

router.get(
  ...defineRoute({
    route: '/me',
    auth,
    validator: null,
    controller: authController.getCurrentUser,
  })
)
router.put(
  ...defineRoute({
    route: '/update-email',
    auth,
    validator: authValidation.updateEmail,
    controller: authController.updateEmail,
  })
)
router.put(
  ...defineRoute({
    route: '/update-password',
    auth,
    validator: authValidation.updatePassword,
    controller: authController.updatePassword,
  })
)
router.post(
  ...defineRoute({
    route: '/login',
    validator: authValidation.login,
    controller: authController.login,
  })
)
router.post(
  ...defineRoute({
    route: '/forgot-password',
    validator: authValidation.forgotPassword,
    controller: authController.forgotPassword,
  })
)
router.post(
  ...defineRoute({
    route: '/reset-password',
    validator: authValidation.resetPassword,
    controller: authController.resetPassword,
  })
)
router.post(
  ...defineRoute({
    route: '/google-login',
    validator: authValidation.googleLogin,
    controller: authController.googleLogin,
  })
)
router.post(
  ...defineRoute({
    route: '/register',
    validator: authValidation.register,
    controller: authController.register,
  })
)
router.get(
  ...defineRoute({
    route: '/welcome/:id',
    // validator: authValidation.register,
    controller: authController.getWelcome,
  })
)
router.post(
  ...defineRoute({
    route: '/welcome',
    // validator: authValidation.register,
    controller: authController.postWelcome,
  })
)
router.post(
  ...defineRoute({
    route: '/deactivate-account',
    auth,
    validator: null,
    controller: authController.deactivateAccount,
  })
)

module.exports = router
