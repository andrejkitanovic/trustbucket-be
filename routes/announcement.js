const express = require('express')
const announcementController = require('../controllers/announcement')
const auth = require('../helpers/auth').auth

const router = express.Router()

router.get('/', auth, announcementController.getAnnouncements)
router.get('/latest', auth, announcementController.getLatestAnnouncement)
router.post('/', auth, announcementController.postAnnouncement)

module.exports = router
