const express = require('express')
const automaticCollectionController = require('../controllers/automaticCollection')
const auth = require('../helpers/auth').auth

const router = express.Router()

router.get('/', auth, automaticCollectionController.getAutomaticCollection)
router.post('/', auth, automaticCollectionController.postAutomaticCollection)

module.exports = router
