const express = require("express");
const logController = require("../controllers/log");

const router = express.Router();

router.get("/", logController.getLogs);
router.post("/filter", logController.filterLogs);

module.exports = router;
