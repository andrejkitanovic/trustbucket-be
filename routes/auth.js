const express = require('express');
const authController = require('../controllers/auth');
const authValidation = require('../validation/auth');
const auth = require('../helpers/auth');

const router = express.Router();

router.get('/me', auth, authController.getCurrentUser);
router.put('/update-email', auth, authValidation.updateEmail, authController.updateEmail);
router.put('/update-password', auth, authValidation.updatePassword, authController.updatePassword);
router.post('/login', authValidation.login, authController.login);
router.post('/forgot-password', authValidation.forgotPassword, authController.forgotPassword);
router.post('/reset-password', authValidation.resetPassword, authController.resetPassword);
router.post('/google-login', authController.googleLogin);
router.post('/register', authValidation.register, authController.register);
router.post('/confirm-email', authController.confirmEmail);

module.exports = router;
