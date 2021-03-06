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

    let logo = null
    if (req.file && req.file.path) {
      logo = `https://backend.trustbucket.io/${req.file.path}`
    }

    const invitationSettings = await InvitationSettings.findOneAndUpdate(
      { company: selectedCompany },
      {
        logo,
        ...req.body,
      },
      { new: true }
    )

    res.status(200).json(invitationSettings)
  } catch (err) {
    next(err)
  }
}
