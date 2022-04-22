const InvitationSettings = require('../models/invitationSettings')

exports.getInvitationSettings = async (req, res, next) => {
    try {
        const { selectedCompany } = req.auth

        const invitationSettings = await InvitationSettings.findOne({
            company: selectedCompany,
        })
        res.status(200).json(invitationSettings)
    } catch (err) {
        next(err)
    }
}

exports.updateInvitationSettings = async (req, res, next) => {
    try {
        const { selectedCompany } = req.auth

        const invitationSettings = await InvitationSettings.findOneAndUpdate(
            { company: selectedCompany },
            {
                ...req.body,
            },
            { new: true }
        )

        res.status(200).json(invitationSettings)
    } catch (err) {
        next(err)
    }
}
