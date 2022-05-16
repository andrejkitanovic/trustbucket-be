const express = require('express')
const profileController = require('../controllers/profile')
const auth = require('../helpers/auth').auth

const router = express.Router()

router.get('/', auth, profileController.getProfile)
router.put('/', auth, profileController.updateProfile)
router.delete('/', auth, profileController.deleteProfile)

module.exports = router
