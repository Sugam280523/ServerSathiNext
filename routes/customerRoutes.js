const express = require('express');
const router = express.Router();
const CustomerController = require('../controllers/Customer__Controller');

// Basic Routes
//router.get('/Customer', CustomerController.index);
//router.get('/LeadCT', CustomerController.CustomerLead__Table);
//router.get('/CLeadTable', CustomerController.CustomerLead__Table__GetData);

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