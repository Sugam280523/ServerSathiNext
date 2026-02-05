const express = require('express');
const router = express.Router();
const EmployeeController = require('../controllers/Employee__Controller');
const upload = require('../middleware/upload');
const { body } = require('express-validator');

// Ensure this path is exactly what you type in the browser
router.get('/EmployeeRegister', EmployeeController.index);
const employeeValidation = [
    body('EmployeeName').notEmpty().withMessage('Name is required'),
    body('EmployeeEmailId')
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Please enter a valid email address.')
    .normalizeEmail(),
    body('UserPassword').isLength({ min: 6 }).withMessage('Password must be 6+ chars'),
    body('CUserPassword').custom((value, { req }) => {
        if (value !== req.body.UserPassword) throw new Error('Passwords do not match');
        return true;
    }),
    body('EmployeeMobileNo')
    .notEmpty().withMessage('Mobile Number is required.')
    .isNumeric().withMessage('Mobile Number must contain only numbers.')
    .isLength({ min: 10 }).withMessage('Mobile Number must be at least 10 digits long.'),
    body('EDesignation').notEmpty().withMessage('Designation is required'),
];

router.post('/EmployeeRegister', upload.single('EmployeeProfile'), employeeValidation, EmployeeController.register);
// routes/employeeRoutes.js
router.get('/EmployeeList', EmployeeController.Employee__Table);
// This tells Express to listen for the AJAX call from DataTables
router.get('/Employee__Table__GetData', EmployeeController.Employee__Table__GetData);
router.get('/get-employee/:id', EmployeeController.getEmployeeById);
// Route to handle the update submission
router.post('/EmployeeUpdate', EmployeeController.Employee__Update);
module.exports = router; // Make sure this is 'router'