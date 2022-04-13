const express = require('express');
const companyController = require('../controllers/company');
const auth = require('../helpers/auth');

const router = express.Router();

router.get('/invoices', auth, companyController.getInvoices);
router.post('/', auth, companyController.postCompany);
router.post('/select', auth, companyController.selectCompany);
router.put('/', auth, companyController.updateCompany);
router.put('/address', auth, companyController.putAddress);
router.post('/subscribe-session', auth, companyController.subscribeSession);

module.exports = router;
