const { getIdAndTypeFromAuth } = require("./auth");
const User = require("../models/user");

exports.getUsers = (req, res, next) => {
  (async function () {
    try {
      const auth = getIdAndTypeFromAuth(req, res, next);
      if (!auth) {
        const error = new Error("Not Authorized!");
        error.statusCode = 401;
        next(error);
      }

      const { id } = auth;

      const users = await User.find({ _id: { $ne: id } });
      const count = await User.find({ _id: { $ne: id } }).countDocuments();

      res.status(200).json({
        data: users,
        total: count,
      });
    } catch (err) {
      next(err);
    }
  })();
};

exports.filterUsers = (req, res, next) => {
  (async function () {
    try {
      const auth = getIdAndTypeFromAuth(req, res, next);
      if (!auth) {
        const error = new Error("Not Authorized!");
        error.statusCode = 401;
        next(error);
      }

      const {
        pageNumber,
        pageSize,
        sortField,
        sortOrder,
      } = req.body.queryParams;
      const { id } = auth;

      const users = await User.find({ _id: { $ne: id } })
        .sort([[sortField, sortOrder === "asc" ? 1 : -1]])
        .skip(Number((pageNumber - 1) * pageSize))
        .limit(Number(pageSize));
      const count = await User.find({ _id: { $ne: id } }).countDocuments();

      res.status(200).json({
        data: users,
        total: count,
      });
    } catch (err) {
      next(err);
    }
  })();
};

exports.deleteUser = (req, res, next) => {
  (async function () {
    try {
      const auth = getIdAndTypeFromAuth(req, res, next);
      if (!auth || auth.type !== "admin") {
        const error = new Error("Not Authorized!");
        error.statusCode = 401;
        next(error);
      }

      const { id } = auth;

      const findId = req.query.id;

      const userDeleted = await User.deleteOne({ _id: findId });

      if (!userDeleted) {
        const error = new Error("User not found!");
        error.statusCode = 404;
        return next(error);
      }

      const users = await User.find({ _id: { $ne: id } });
      const count = await User.find({ _id: { $ne: id } }).countDocuments();

      res.status(200).json({
        data: users,
        total: count,
        message: "User successfully deleted!",
      });
    } catch (err) {
      next(err);
    }
  })();
};
