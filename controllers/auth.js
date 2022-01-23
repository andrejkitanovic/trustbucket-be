const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const getIdAndTypeFromAuth = (req, res, next) => {
  if (req.headers && req.headers.authorization) {
    let authorization = req.headers.authorization.split(" ")[1];
    let decoded = jwt.verify(authorization, process.env.DECODE_KEY);
    return {
      id: decoded.id,
      type: decoded.type,
    };
  }
  return null;
};

exports.getCurrentUser = (req, res, next) => {
  (async function () {
    const auth = getIdAndTypeFromAuth(req, res, next);
    if (!auth) {
      const error = new Error("Not Authorized!");
      error.statusCode = 401;
      next(error);
    }

    const { id } = auth;

    try {
      const currentUser = await User.findById(id);

      res.status(200).json({
        data: currentUser,
      });
    } catch (err) {
      next(err);
    }
  })();
};

exports.updateEmail = (req, res, next) => {
  (async function () {
    try {
      const auth = getIdAndTypeFromAuth(req, res, next);
      if (!auth) {
        const error = new Error("Not Authorized!");
        error.statusCode = 401;
        next(error);
      }
      const { id } = auth;

      const { newEmail, password } = req.body;
      const loginUser = await User.findById(id);

      if (!loginUser) {
        const error = new Error("User not found!");
        error.statusCode = 404;
        return next(error);
      }

      const validPassword = await bcrypt.compare(password, loginUser.password);

      if (!validPassword) {
        const error = new Error("Password is not valid!");
        error.statusCode = 401;
        return next(error);
      }

      loginUser.email = newEmail;
      const savedUser = await loginUser.save();

      res.status(200).json({
        data: savedUser,
        message: "Successful changed email!",
      });
    } catch (err) {
      next(err);
    }
  })();
};

exports.updatePassword = (req, res, next) => {
  (async function () {
    try {
      const auth = getIdAndTypeFromAuth(req, res, next);
      if (!auth) {
        const error = new Error("Not Authorized!");
        error.statusCode = 401;
        next(error);
      }
      const { id } = auth;

      const { newPassword, password } = req.body;
      const loginUser = await User.findById(id);

      if (!loginUser) {
        const error = new Error("User not found!");
        error.statusCode = 404;
        return next(error);
      }

      const validPassword = await bcrypt.compare(password, loginUser.password);

      if (!validPassword) {
        const error = new Error("Password is not valid!");
        error.statusCode = 401;
        return next(error);
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12);

      loginUser.password = hashedPassword;
      const savedUser = await loginUser.save();

      res.status(200).json({
        data: savedUser,
        message: "Successful changed password!",
      });
    } catch (err) {
      next(err);
    }
  })();
};

exports.login = (req, res, next) => {
  (async function () {
    try {
      const ip =
        req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;

      const { email, password } = req.body;
      const loginUser = await User.findOne({ email });

      if (!loginUser) {
        const error = new Error("User not found!");
        error.statusCode = 404;
        return next(error);
      }

      const validPassword = await bcrypt.compare(password, loginUser.password);

      if (!validPassword) {
        const error = new Error("Password is not valid!");
        error.statusCode = 401;
        return next(error);
      }

      const token = jwt.sign(
        { id: loginUser._id, type: loginUser.type },
        process.env.DECODE_KEY,
        {
          // expiresIn: "1h",
        }
      );

      res.status(200).json({
        token,
        data: loginUser,
        message: "Successful login!",
      });
    } catch (err) {
      next(err);
    }
  })();
};

exports.register = (req, res, next) => {
  (async function () {
    try {
      const { password } = req.body;
      const hashedPassword = await bcrypt.hash(password, 12);

      const userObject = new User({
        ...req.body,
        password: hashedPassword,
      });
      const userCreated = await userObject.save();

      if (userCreated) {
        res.status(200).json({
          data: userObject,
          message: "User successfully registered!",
        });
      }
    } catch (err) {
      next(err);
    }
  })();
};

exports.getIdAndTypeFromAuth = getIdAndTypeFromAuth;
