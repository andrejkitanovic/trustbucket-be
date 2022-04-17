const express = require('express');
const userController = require('../controllers/user');
const auth = require('../helpers/auth');

const router = express.Router();

router.get('/', auth.adminAuth, userController.getUsers);
router.post('/filter', auth.adminAuth, userController.filterUsers);
// Should be auth admin
router.delete('/', auth.adminAuth, userController.deleteUser);

module.exports = router;
