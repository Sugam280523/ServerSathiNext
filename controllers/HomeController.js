const crypto = require('crypto');
const nodemailer = require('nodemailer');
const EmpModel = require('../models/EmpModel');
const CustModel = require('../models/CustModel'); // <--- ADD THIS LINE
const { validationResult } = require('express-validator');
const db = require('../db');
const HomeController = {
    // Show Login Page
    index: (req, res) => {
        res.render('forms/Login');
    },

    // Handle Login Post
    login: async (req, res) => {
        const { UserName, PassWord } = req.body;
        
        // Base64 encode password to match your PHP logic
        const encodedPass = Buffer.from(PassWord).toString('base64');

        try {
            const users = await EmpModel.getEmployeeWithId(UserName, encodedPass);

            if (users.length > 0) {
                const user = users[0];
                // Set Session (newdata in CI)
                req.session.user = {
                    id: user.DB_UserId,
                    name: user.DB_UserName,
                    email: user.DB_UserEmailId,
                    role: user.DB_UserRole
                };
                req.session.save((err) => {
                    if (err) {
                        // Handle error (log it)
                        return res.status(500).send("Session save failed");
                    }
                    return res.redirect('/DashBoard');
                });
            } else {
                req.flash('error', 'Invalid credentials!');
                return res.redirect('/');
            }
        } catch (err) {
            res.status(500).send("Internal Server Error");
        }
    },

    // Dashboard Logic
        dashboard: async (req, res) => {
            if (!req.session.user) {
                return res.redirect('/');
            }

            // 1. Initialize ALL variables used in index.ejs
            let data = {
                Total_Live_Customer: 0,
                Total_Lead_Customer: 0,
                Total_Demo_Customer: 0,
                Total_AMC_Expired_Customer: 0,
                Total_Payment_Pending_Customer: 0,
                Total_Payment_Recived_Customer: 0,
                Today_Live_Customer: 0,
                Today_Lead_Customer: 0,
                Today_Demo_Customer: 0,
                Today_AMC_Expired_Customer: 0,
                Today_Payment_Pending_Customer: 0,
                Today_Payment_Recived_Customer: 0,
                AMC_Expired_List: [],
                Payment_Due_List: [],
                user: req.session.user
            };

            try {
                // 2. Fetch all data using Promise.all for speed
                const [
                    live, lead, demo, amc, pending, received,
                    tLive, tLead, tDemo, tAmc, tPending, tReceived,
                    amcList, paymentList
                ] = await Promise.all([
                    CustModel.DB__CustomerLiveDashboard__Get(),
                    CustModel.DB__CustomerLeadDashboard__Get()
                ]);
                /* const [
                    live, lead, demo, amc, pending, received,
                    tLive, tLead, tDemo, tAmc, tPending, tReceived,
                    amcList, paymentList
                ] =await Promise.all([
                    CustModel.DB__CustomerLiveDashboard__Get(),
                    CustModel.DB__CustomerLeadDashboard__Get(),
                    CustModel.DB__CustomerDemoDashboard__Get(),
                    CustModel.DB__CustomerAMCExpiredDashboardN__Get(),
                    CustModel.DB__CustomerPaymentPendingDashboardN__Get(),
                    CustModel.DB__CustomerPaymentRecivedDashboard__Get(),
                    CustModel.DB__CustomerTodayLiveDashboard__Get(),
                    CustModel.DB__CustomerTodayLeadDashboard__Get(),
                    CustModel.DB__CustomerTodayDemoDashboard__Get(),
                    CustModel.DB__CustomerTodayAMCExpiredDashboard__Get(),
                    CustModel.DB__CustomerTodayPaymentPendingDashboard__Get(),
                    CustModel.DB__CustomerTodayPaymentRecivedDashboard__Get(),
                    CustModel.DB__CustomerAMCExpiredDashboard__Get(),
                    CustModel.DB__CustomerPaymentPendingDashboard__Get()
                ]); */
                // 3. Assign fetched values
                data.Total_Live_Customer = live || 0;
                data.Total_Lead_Customer = lead || 0;
                data.Total_Demo_Customer = demo || 0;
                data.Total_AMC_Expired_Customer = amc || 0;
                data.Total_Payment_Pending_Customer = pending || 0;
                data.Total_Payment_Recived_Customer = received || 0;
                
                data.Today_Live_Customer = tLive || 0;
                data.Today_Lead_Customer = tLead || 0;
                data.Today_Demo_Customer = tDemo || 0;
                data.Today_AMC_Expired_Customer = tAmc || 0;
                data.Today_Payment_Pending_Customer = tPending || 0;
                data.Today_Payment_Recived_Customer = tReceived || 0;

                data.AMC_Expired_List = amcList || [];
                data.Payment_Due_List = paymentList || [];

            } catch (error) {
                console.error("Dashboard Data Fetch Error:", error);
            }

            // 4. Pass the entire data object to EJS
            res.render('index', data);
            },
            forgot__password : async (req, res) => { 
                try {
                    res.render('forms/forgot-password', {
                    messages: {
                        success: req.flash('success'),
                        error: req.flash('error')
                    },
                    formData: req.flash('formData')[0] || {},
                    errors: req.flash('errors')[0] || {},
                    user: req.session.user
                });
                } catch (err) {
                    res.status(500).send("Database Error");
                }
            },
            forgotPassword : async (req, res) =>{
            const errors = validationResult(req);
                    if (!errors.isEmpty()) {
                        req.flash('errors', errors.mapped());
                        req.flash('formData', req.body);
                        return res.redirect('/forgot-password');
                    }
               
                    try {
                        const { UserName: email } = req.body;

                        // 1. Check if email exists in DB
                        const [users] = await db.query(
                            "SELECT DB_User__Password FROM db_tbl__userdetails WHERE DB_UserEmailId = ?", 
                            [email]
                        );

                        if (users.length === 0) {
                            req.flash('error', 'Email address not found.');
                            return res.redirect('/forgot-password');
                        }

                        // 2. Generate Token and OTP
                        const token = crypto.randomBytes(50).toString('hex');
                        const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
                        const lastPassword = users[0].DB_User__Password;

                        // 3. Prepare Data for Insertion
                        const resetData = {
                            DB_Cust__UserMail: email,
                            DB_Cust__Token: token,
                            DB_Cust__OTP: otp,
                            DB_Last__Password: lastPassword,
                            DB_New__Password: '',
                            DB__ForgotPassword__Date: new Date().toISOString().slice(0, 19).replace('T', ' '),
                            DB__ForgotStatus: 0
                        };

                        // 4. Insert into Reset Token Table
                        const [result] = await db.query("INSERT INTO db_tbl__userdetailsforgotinfo SET ?", [resetData]);
                        const insertId = result.insertId;

                        // 5. Setup Nodemailer (SMTP Configuration)
                        const transporter = nodemailer.createTransport({
                            host: 'smtp.gmail.com',
                            port: 587,
                            secure: false, // TLS
                            auth: {
                                user: 'mahesh.sugamsofttech@gmail.com',
                                pass: 'jbeh oeje yeyk oaik' // Use App Password
                            }
                        });

                        // 6. Define Email Content
                        const mailOptions = {
                            from: '"Sathi CRM" <mahesh.sugamsofttech@gmail.com>',
                            to: email,
                            cc: 'sugam.namita@gmail.com',
                            subject: 'Sathi - Password Reset OTP',
                            html: `
                                <p>Dear User,</p>
                                <p>Your One-Time Password (OTP) for password verification is:</p>
                                <h3>OTP: ${otp}</h3>
                                <p>Please use this OTP to proceed with resetting your password. This OTP is valid for the next 15 minutes.</p>
                                <p>If you did not request this, please ignore this email.</p>
                                <br>
                                <p>Regards,<br>Sugam Team</p>
                            `
                        };

                        // 7. Send the Email
                        await transporter.sendMail(mailOptions);

                        // 8. Redirect on Success
                        req.flash('success', 'OTP has been sent to your email address.');
                        res.redirect(`/ResetPassword/${insertId}`);

                    } catch (err) {
                        console.error("Forgot Password Error:", err);
                        req.flash('error', 'Internal Server Error. Please try again.');
                        res.redirect('/forgot-password');
                    }
            },
            resetPasswordPage: async (req, res) => {
                try {
                    const { id } = req.params; // This is the insertId from the forgotPassword step
                    
                    // Fetch reset data to ensure the ID is valid
                    const [resetEntry] = await db.query(
                        "SELECT * FROM db_tbl__userdetailsforgotinfo WHERE DB_Cust__ForgotId = ? AND DB__ForgotStatus = 0", 
                        [id]
                    );

                    if (resetEntry.length === 0) {
                        req.flash('error', 'Invalid or expired reset link.');
                        return res.redirect('/forgot-password');
                    }

                    res.render('forms/reset-password', {
                        id: id,
                        email: resetEntry[0].DB_Cust__UserMail,
                        messages: {
                            success: req.flash('success'),
                            error: req.flash('error')
                        },
                        errors: req.flash('errors')[0] || {}
                    });
                } catch (err) {
                    res.status(500).send("Internal Server Error");
                }
            },

            // POST: Process the OTP and New Password
            processResetPassword: async (req, res) => {
                try {
                    const { id, otp, newPassword, confirmPassword } = req.body;

                    // 1. Basic Validation
                    if (newPassword !== confirmPassword) {
                        req.flash('error', 'Passwords do not match.');
                        return res.redirect(`/ResetPassword/${id}`);
                    }

                    // 2. Verify OTP and ID
                    const [resetEntry] = await db.query(
                        "SELECT * FROM db_tbl__userdetailsforgotinfo WHERE DB_Cust__ForgotId = ? AND DB_Cust__OTP = ? AND DB__ForgotStatus = 0", 
                        [id, otp]
                    );

                    if (resetEntry.length === 0) {
                        req.flash('error', 'Invalid OTP. Please check your email.');
                        return res.redirect(`/ResetPassword/${id}`);
                    }

                    const email = resetEntry[0].DB_Cust__UserMail;

                    // 3. Update User Password in User Table
                    // Note: Use bcrypt.hash if you are encrypting passwords
                    await db.query(
                        "UPDATE db_tbl__userdetails SET DB_User__Password = ? WHERE DB_UserEmailId = ?", 
                        [Buffer.from(req.body.newPassword).toString('base64'), email]
                    );

                    // 4. Mark Token as Used
                    await db.query(
                        "UPDATE db_tbl__userdetailsforgotinfo SET DB__ForgotStatus = 1, DB_New__Password = ? WHERE DB_Cust__ForgotId  = ?", 
                        [Buffer.from(req.body.newPassword).toString('base64'), id]
                    );

                    req.flash('success', 'Password reset successfully. You can now login.');
                    res.redirect('/'); // Redirect to Login Page

                } catch (err) {
                    console.error(err);
                    req.flash('error', 'Something went wrong.');
                    res.redirect('/');// Redirect to Login Page

                }
            }
};

module.exports = HomeController;