const express = require('express');
const invitationSettingsController = require('../controllers/invitationSettings');

const router = express.Router();

router.get('/', invitationSettingsController.getInvitationSettings);
router.put('/', invitationSettingsController.updateInvitationSettings);

module.exports = router;
