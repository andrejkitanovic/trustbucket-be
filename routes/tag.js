const express = require('express')
const tagController = require('../controllers/tag')
const auth = require('../helpers/auth').auth

const router = express.Router()

router.get('/', auth, tagController.getTags)
router.post('/', auth, tagController.postTag)
router.delete('/:id', auth, tagController.deleteTag)

module.exports = router
