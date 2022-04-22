const helperValidation = require('./validation')

module.exports = ({ route, auth, validator, controller }) => {
  if (validator) {
    validator.push(helperValidation)
  }

  return [route, auth, validator, controller]
}
