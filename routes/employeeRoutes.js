const express = require('express');
const router = express.Router();
const EmployeeController = require('../controllers/Employee__Controller');

router.get('/EmployeeRegister', EmployeeController.index);
router.post('/EmployeeU/:id', EmployeeController.Employee__Update);
router.get('/EmployeeT', EmployeeController.Employee__Table);
router.get('/myEmployeeTable', EmployeeController.Employee__Table__GetData);
router.post('/ChangeEmployeeStatusAPI', EmployeeController.Change__Employee__Status);

module.exports = router;