const Announcement = require('../models/announcement')

exports.getAnnouncements = async (req, res, next) => {
  try {
    const announcements = await Announcement.find()
    const count = await Announcement.countDocuments()

    res.status(200).json({
      data: announcements,
      total: count,
    })
  } catch (err) {
    next(err)
  }
}

exports.getLatestAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findOne(
      {},
      {},
      { sort: { createdAt: -1 } }
    )

    res.status(200).json({
      data: announcement,
    })
  } catch (err) {
    next(err)
  }
}

exports.postAnnouncement = async (req, res, next) => {
  try {
    const { type } = req.auth

    if (type !== 'admin') {
      return res.status(403).json({ message: 'Not Authorized' })
    }

    const announcementObject = new Announcement({
      ...req.body,
    })
    await announcementObject.save()

    res.status(200).json({
      message: 'Announcement created!',
    })
  } catch (err) {
    next(err)
  }
}
