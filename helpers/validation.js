const { validationResult } = require('express-validator');

const validation = async (req, res, next) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }

  if (!errors.isEmpty()) {
    const firstErrors = errors.array({ onlyFirstError: true });
    const errorsToString = firstErrors.map((error) => error.msg).join(', ');
    const capitalizeError = errorsToString.charAt(0).toUpperCase() + errorsToString.slice(1);

    return res.status(400).json({
      message: `${capitalizeError}!`,
    });
  }

  return next();
};

module.exports = validation;
