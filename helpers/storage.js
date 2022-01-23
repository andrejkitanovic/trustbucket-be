const path = require("path");
const multer = require("multer");

module.exports = (app, express) => {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "uploads");
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + "-" + file.originalname);
    },
  });

  app.use(multer({ storage: storage }).single("file"));
};
