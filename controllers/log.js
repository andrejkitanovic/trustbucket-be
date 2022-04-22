const Log = require('../models/log');

exports.getLogs = async (req, res, next) => {
  try {
    const { id } = req.auth;

    const logs = await Log.find({ user: id }).populate('user', 'email');
    const count = await Log.countDocuments({ user: id });

    res.status(200).json({
      data: logs,
      total: count,
    });
  } catch (err) {
    next(err);
  }
};

exports.filterLogs = async (req, res, next) => {
  try {
    const {
      pageNumber, pageSize, sortField, sortOrder,
    } = req.body.queryParams;

    const { id } = req.auth;

    const logs = await Log.find({ user: id })
      .sort([[sortField, sortOrder === 'asc' ? 1 : -1]])
      .skip(Number((pageNumber - 1) * pageSize))
      .limit(Number(pageSize))
      .populate('user', 'email');
    const count = await Log.countDocuments({ user: id });

    res.status(200).json({
      data: logs,
      total: count,
    });
  } catch (err) {
    next(err);
  }
};

exports.postLog = async (log) => {
  try {
    const logObject = new Log(log);
    logObject.save();
  } catch (err) {
    console.log(err);
  }
};
