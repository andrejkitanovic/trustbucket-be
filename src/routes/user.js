const express = require('express')
const userController = require('../controllers/user')
const auth = require('../helpers/auth').auth

const router = express.Router()

router.get('/', auth, userController.getUsers)
router.post('/filter', auth, userController.filterUsers)
// Should be auth admin
router.delete('/:id', auth, userController.deleteUser)

module.exports = router
