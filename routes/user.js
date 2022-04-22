const express = require('express')
const userController = require('../controllers/user')
const auth = require('../helpers/auth')

const router = express.Router()

router.get('/', auth, userController.getUsers)
router.post('/filter', auth, userController.filterUsers)
// Should be auth admin
// router.delete('/', auth, userController.deleteUser)

module.exports = router
