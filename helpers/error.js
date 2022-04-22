module.exports = (app) => {
  app.use((error, req, res, next) => {
    const status = error.statusCode || 500

    if (error && error.response && error.response.data) {
      res.status(status).json(error.response.data)
    } else {
      const { message } = error
      const { data } = error
      res.status(status).json({ message, data })
    }
  })
}
