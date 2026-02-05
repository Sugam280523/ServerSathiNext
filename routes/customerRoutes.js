const express = require('express');
const router = express.Router();
const CustomerController = require('../controllers/Customer__Controller');
const { body } = require('express-validator');

const multer = require('multer');
const upload = multer();
// Basic Routes
router.get('/Lead', CustomerController.leadView);
const customerValidation = [
    body('FirmName').notEmpty().withMessage('Firm Name is required'),
    body('CustomerName').notEmpty().withMessage('Owner Name is required.'),
    body('mobilenumber').notEmpty().withMessage('Mobile Number is required.')
    .isNumeric().withMessage('Mobile Number must contain only numbers.')
    .isLength({ min: 10 }).withMessage('Mobile Number must be at least 10 digits long.'),
    body('city').notEmpty().withMessage('City is required'),
    body('State').notEmpty().withMessage('State is required'),
    body('serialnumber').notEmpty().withMessage('Serial Number is required')
];

router.post('/Lead', customerValidation, CustomerController.register);
router.get('/LeadTable', CustomerController.CustomerLead__Table);
router.post('/LeadCustomer__Table__GetData', CustomerController.LeadCustomer__Table__GetData);
router.get('/get-Customer/:id',CustomerController.getCustomerById);
router.post('/update-Customer-Lead',upload.none(),CustomerController.updateCustomerLead)

//Demo Realted Routings
router.get('/Demo', CustomerController.demoView);
router.get('/getCustomerDetails/:id',CustomerController.getCustomerById);
const DemocustomerValidation = [
    body('CustomerID').notEmpty().withMessage('Customer Select is required'),
    body('CustLicNo').notEmpty().withMessage('Cust Lic No is required'),
    body('ApiKey').notEmpty().withMessage('Api Key is required.'),
    body('clientsecret').notEmpty().withMessage('clientsecret is required.')
];
router.post('/Demo',DemocustomerValidation, CustomerController.demoRegister);
router.get('/DemoTable', CustomerController.CustomerDemo__Table);
router.post('/DemoCustomer__Table__GetData',CustomerController.DemoCustomer__Table__GetData);
router.post('/update-Customer-Demo',upload.none(),CustomerController.updateCustomerDemo)
//activation routing 
router.get('/Activation', CustomerController.activationView);
router.get('/getCustomerDetailsWithActivation/:id',CustomerController.getCustomerByIdActivation);
router.post('/Customer-Demo-Extend',CustomerController.Customer__Demo__Extended);
const ActivationcustomerValidation = [
    body('CustomerIDAct').notEmpty().withMessage('Customer Select is required'),
    body('paymentMode').notEmpty().withMessage('Payment Mode is required'),
    body('PaymentProof').notEmpty().withMessage('Payment Proof is required.')
];
router.post('/Activation', ActivationcustomerValidation,CustomerController.activationRegister);
router.get('/ActivationTable', CustomerController.CustomerActivation__Table);
router.post('/ActivationsCustomer__Table__GetData',CustomerController.ActivationCustomer__Table__GetData);
// Demo & Activation
//router.get('/Customer-Demo', CustomerController.Customer__Demo__Activation);
//router.get('/Customer-Profile', CustomerController.Customer__Profile);
//router.get('/CDemoTable', CustomerController.CustomerDemo__Table__GetData);
//router.get('/Customer-Activation', CustomerController.Customer__Activation);

// API & Parameters (CI (:num) becomes Express :id)
//router.get('/Customer-get-Details/:id', CustomerController.Customer__Details__API);
//router.post('/CustomerU/:id', CustomerController.Customer__Update);
//router.post('/CustomerActivationU/:id', CustomerController.Customer__Activation__Update);

// Table & Status API
//router.get('/myCustomerTable', CustomerController.Customer__Table__GetData);
//router.post('/ChangeCustomerStatusAPI', CustomerController.Change__Customer__Status);

module.exports = router;