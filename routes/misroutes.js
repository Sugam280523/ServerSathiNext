const express = require('express');
const router = express.Router();
const MIS__Controller = require('../controllers/MIS__Controller');
const { body } = require('express-validator');

const multer = require('multer');
const upload = multer();
// Basic Routes
router.get('/TotalLiveCustomerTable', MIS__Controller.TotalLiveCustomer__Table);
router.post('/TotalLiveCustomerTable__GetData', MIS__Controller.TotalLiveCustomerTable__GetData);
router.get('/AMCExpiredThirtyDaysT', MIS__Controller.AMCExpiredThirtyDays__Table);
router.post('/AMCExpiredThirtyDaysT__GetData', MIS__Controller.AMCExpiredThirtyDaysT__GetData);
router.get('/AMCExpiredT', MIS__Controller.AMCExpired__Table);
router.post('/AMCExpiredT__GetData', MIS__Controller.AMCExpiredT__GetData);
router.get('/TotalCustomerTable', MIS__Controller.TotalCustomer__Table);
router.post('/TotalCustomerTable__GetData', MIS__Controller.TotalCustomerTable__GetData);

module.exports = router;