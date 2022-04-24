const helperValidation = require('./validation')

module.exports = ({ route, auth, validator, controller }) => {
  if (!route || !controller) {
    throw new Error('Missing essential route information!')
  }

  const list = [route]

  if (auth) {
    list.push(auth)
  }

  if (validator) {
    list.push(validator)
    list.push(helperValidation)
  }

  list.push(controller)
  return list
}
