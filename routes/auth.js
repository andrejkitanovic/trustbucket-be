const express = require('express');
const userController = require('../controllers/auth');

const router = express.Router();

router.get('/me', userController.getCurrentUser);
router.put('/update-email', userController.updateEmail);
router.put('/update-password', userController.updatePassword);
router.post('/login', userController.login);
router.post('/register', userController.register);

module.exports = router;
