module.exports = (app) => {
  app.use((error, req, res, next) => {
    const status = error.statusCode || 500;

    if (error && error.response && error.response.data) {
      res.status(status).json(error.response.data);
    } else {
      const message = error.message;
      const data = error.data;
      res.status(status).json({ message: message, data: data });
    }
  });
};
