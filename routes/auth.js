const express = require('express');
const userController = require('../controllers/auth');
const auth = require('../helpers/auth');

const router = express.Router();

router.get('/me', auth, userController.getCurrentUser);
router.put('/update-email', auth, userController.updateEmail);
router.put('/update-password', auth, userController.updatePassword);
router.post('/login', userController.login);
router.post('/google-login', userController.googleLogin);
router.post('/register', userController.register);
router.post('/confirm-email', userController.confirmEmail);
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password', userController.resetPassword);

module.exports = router;
