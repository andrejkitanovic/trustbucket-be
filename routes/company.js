const express = require('express');
const companyController = require('../controllers/company');

const router = express.Router();

router.post('/', companyController.postCompany);
router.post('/select', companyController.selectCompany);
router.put('/', companyController.updateCompany);
router.put('/address', companyController.putAddress);
router.post('/subscribe-session', companyController.subscribeSession);
router.get('/subscribe-success', companyController.subscribeSuccess);
router.get('/subscribe-cancel', companyController.subscribeCancel);

module.exports = router;
