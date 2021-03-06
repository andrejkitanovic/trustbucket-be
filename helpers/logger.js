const geoip = require('geoip-lite')
const logController = require('../controllers/log')

module.exports = (app) => {
  app.use((req, res, next) => {
    const ip = req.headers['x-real-ip']
    let location = {}

    if (ip) {
      location = geoip.lookup(ip)
    }

    const { method, _parsedUrl } = req

    next()

    res.on('finish', () => {
      const { auth } = req
      const { statusCode } = res

      const logObject = {
        method,
        ip,
        location,
        endpoint: _parsedUrl.pathname,
        status: statusCode,
        authenticated: !!auth,
        user: auth && auth.id,
      }

      logController.postLog(logObject)
    })
  })
}
