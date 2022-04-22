module.exports = (app) => {
    app.use((req, res, next) => {
        req.headers.origin = req.headers.origin || req.headers.host
        next()
    })
}
