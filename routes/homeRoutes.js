const express = require('express');
const router = express.Router();
const HomeController = require('../controllers/HomeController');
const { body } = require('express-validator');
const db = require('../db');

router.get('/', HomeController.index);
router.post('/login', HomeController.login); // Match form action
router.get('/DashBoard', HomeController.dashboard);
router.get('/forgot-password',HomeController.forgot__password);
const employeeValidation = [
   
    body('UserName')
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Please enter a valid email address.')
    .custom(async (value) => {
                const email = value.trim();
                // Perform the query
                const [result] = await db.query(
                    'SELECT * FROM db_tbl__userdetails WHERE LOWER(DB_UserEmailId) = LOWER(?)', 
                    [email]
                );

                // Debug: See exactly what 'result' looks like
               // mysql2 returns [rows, fields]. We extract the first element.
                const rows = Array.isArray(result[0]) ? result[0] : result;
               if (!rows || rows.length === 0) {
                    throw new Error('This email is not registered in our system.');
                }
                return true;
            }),
];
router.post('/forgot-password',employeeValidation,HomeController.forgotPassword);
// Show Reset Page
router.get('/ResetPassword/:id', HomeController.resetPasswordPage);

// Handle the Form Submission
router.post('/process-reset-password', HomeController.processResetPassword);
router.get('/LogOut', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

module.exports = router;