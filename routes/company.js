const express = require('express')
const companyController = require('../controllers/company')
const companyValidation = require('../validation/company')
const auth = require('../helpers/auth')

const router = express.Router()

router.post('/filter', auth, companyController.filterCompanies)
router.get('/invoices', auth, companyController.getInvoices)
router.post(
  '/',
  auth,
  companyValidation.postCompany,
  companyController.postCompany
)
router.post(
  '/select',
  auth,
  companyValidation.selectCompany,
  companyController.selectCompany
)
router.put('/', auth, companyController.updateCompany)
router.put('/billing-info', auth, companyController.updateCompanyBillingInfo)
router.put('/address', auth, companyController.putAddress)
router.post('/subscribe-session', auth, companyController.subscribeSession)
router.post(
  '/update-payment-session',
  auth,
  companyController.updatePaymentInfoSession
)
router.post('/change-plan', auth, companyController.changePlanSession)
router.post('/upload-photo', auth, companyController.uploadPhoto)

module.exports = router
