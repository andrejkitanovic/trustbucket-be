const express = require('express');
const invitationSettingsController = require('../controllers/invitationSettings');
const auth = require('../helpers/auth');

const router = express.Router();

router.get('/', auth, invitationSettingsController.getInvitationSettings);
router.put('/', auth, invitationSettingsController.updateInvitationSettings);

module.exports = router;
