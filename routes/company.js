const express = require("express");
const companyController = require("../controllers/company");

const router = express.Router();

router.post("/", companyController.postCompany);
router.post("/select", companyController.selectCompany);

module.exports = router;
