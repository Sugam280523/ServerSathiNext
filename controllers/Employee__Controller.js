// controllers/Employee__Controller.js
const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const _dataInsert = require('../models/dataBaseQueryManage');
const EmpModel = require('../models/EmpModel'); // Import your model
const db = require('../db');
const Employee__Controller = {
    index: (req, res) => {
        if (!req.session.user) {
            return res.redirect('/');
        }
        try {
            // Clear flash messages into local variables
            const flashMessages = {
                success: req.flash('success'),
                error: req.flash('error')
            };

            res.render('employee', {
                // Pass explicitly to avoid "is not defined" errors
                messages: flashMessages, 
                errors: {}, 
                formData: {}
            });
        } catch (err) {
            console.error("Render Error:", err);
            res.status(500).send("Internal Server Error");
        }
    },
    register: async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // Map errors to the format used in your EJS
            const errorMap = {};
            errors.array().forEach(err => errorMap[err.path] = err.msg);

            return res.render('employee', {
                messages: { error: 'validation is required' },
                errors: errorMap,
                formData: req.body
            });
        }

        try {
            if (!req.session || !req.session.user) {
                req.flash('error', 'Session expired. Please login again.');
                return res.redirect('/login'); // Or your login path
            }
            const _table = "db_tbl__userdetails";
            const _nowDateTime = new Date();
                // Data received from request body
                const _userData = {
                    DB_UserName: req.body.EmployeeName ,
                    DB_UserEmailId: req.body.EmployeeEmailId,
                    DB_UserMobileNo: req.body.EmployeeMobileNo,
                    DB_Designation: req.body.EDesignation,
                    DB_UserRole: req.body.EmployeeRole,
                    DB_UserProfile: req.file ? req.file.filename : 'default.png',
                    DB_User__CurrentDate: _nowDateTime.toISOString(),
                    DB_User__LastUpdateDate: _nowDateTime.toISOString(),
                    DB_User__ID: req.session.user.id,
                    DB_User__LastUpdateId: req.session.user.id,
                    DB_UserStatus: 1,
                    // Remember to use Capital 'B' for Buffer if you are encoding!
                    DB_User__Password: Buffer.from(req.body.UserPassword).toString('base64')
                };
               // console.log(_userData);
                // Pass table name and data to Model
                const result = await _dataInsert.insertData(_table, _userData);
                // 3. If successful, set flash message and redirect
               if (result) {
                    req.flash('success', 'Employee Registered Successfully!'); // Only set on success
                }
                res.redirect('/EmployeeRegister');
           

            } catch (err) {
                // 4. Handle errors (Database errors, etc.)
                console.error("Registration Error:", err);
                req.flash('error', 'Database Error: ' + err.message);
                return res.redirect('/EmployeeRegister');
        }
    },

    Employee__Update: (req, res) => {
        res.send("Employee Update API");
    },
    Employee__Table: async (req, res) => {
        if (!req.session.user) return res.redirect('/');

        try {
            const employees = await EmpModel.getAllEmployees();
            
            res.render('employee_list', { 
                employees: employees,
                user: req.session.user 
            });
        } catch (err) {
            console.error("Fetch Error:", err);
            res.status(500).send("Error fetching employees");
        }
    },
    Employee__Table__GetData: async (req, res) => {
            try {
                const draw = req.query.draw;
                const start = parseInt(req.query.start) || 0;
                const length = parseInt(req.query.length) || 10;
                const searchSearch = req.query.search ? req.query.search.value : '';
                const roleFilter = req.query.role || '';

                // 1. Build whereClause with explicit 'main.' prefix
                let whereClause = " WHERE 1=1";
                let params = [];

                if (roleFilter !== "") {
                    whereClause += " AND main.DB_UserRole = ?";
                    params.push(roleFilter);
                }

                if (searchSearch !== "") {
                    whereClause += " AND (main.DB_UserName LIKE ? OR main.DB_UserEmailId LIKE ? OR main.DB_UserMobileNo LIKE ?)";
                    const searchVal = `%${searchSearch}%`;
                    params.push(searchVal, searchVal, searchVal);
                }

                // 2. Counts (Standard queries)
                const [totalCount] = await db.query("SELECT COUNT(*) as total FROM db_tbl__userdetails");
                const [filteredCount] = await db.query("SELECT COUNT(*) as total FROM db_tbl__userdetails main" + whereClause, params);

                // 3. The Self-Join Query (The Fix)
                let dataSql = `
                        SELECT 
                            main.DB_UserId,
                            main.DB_UserName AS EmployeeName, 
                            main.DB_UserEmailId,
                            main.DB_User__Password,
                            main.DB_UserMobileNo,
                            main.DB_Designation,
                            main.DB_UserRole,
                            main.DB_UserStatus,
                            main.DB_UserProfile,
                            main.DB_User__CurrentDate,
                            main.DB_User__LastUpdateDate,
                            creator.DB_UserName AS CreatorName, 
                            updater.DB_UserName AS UpdaterName
                        FROM db_tbl__userdetails main
                        LEFT JOIN db_tbl__userdetails creator ON main.DB_User__ID = creator.DB_UserId
                        LEFT JOIN db_tbl__userdetails updater ON main.DB_User__LastUpdateId = updater.DB_UserId
                        ${whereClause} 
                        ORDER BY main.DB_User__CurrentDate DESC 
                        LIMIT ? OFFSET ?`;

                let dataParams = [...params, length, start];
                const [rows] = await db.query(dataSql, dataParams);

                res.json({
                    draw: draw,
                    recordsTotal: totalCount[0].total,
                    recordsFiltered: filteredCount[0].total,
                    data: rows
                });

            } catch (err) {
                console.error("SQL Error:", err);
                res.status(500).json({ error: err.message });
            }
        },
        getEmployeeById: async (req, res) => {
            try {
                const empId = req.params.id;
                const employee = await EmpModel.getEmployeeById(empId);

                if (!employee) {
                    return res.status(404).json({ message: "Employee not found" });
                }

                // Decode password if you need to show it (since you encoded it in base64 during register)
                if (employee.DB_User__Password) {
                    employee.decodedPassword = Buffer.from(employee.DB_User__Password, 'base64').toString('ascii');
                }

                res.json(employee);
            } catch (err) {
                console.error("Fetch Single Employee Error:", err);
                res.status(500).json({ message: "Error retrieving employee data" });
            }
        },
       Employee__Update: async (req, res) => {
                try {
                    // 1. Session Check
                    if (!req.session || !req.session.user) {
                        return res.status(401).json({ status: "error", message: "Session expired" });
                    }

                    const empId = req.body.EmployeeId; 
                    const _nowDateTime = new Date();

                    // 2. Prepare Data (Matching your HTML 'name' attributes)
                    const _updateData = {
                        DB_UserName: req.body.EmployeeName,
                        DB_UserEmailId: req.body.EmployeeEmailId,
                        DB_UserMobileNo: req.body.DB_UserMobileNo, // Updated name
                        DB_Designation: req.body.DB_Designation,   // Updated name
                        DB_UserRole: req.body.DB_UserRole,         // Updated name
                        DB_UserStatus: req.body.DB_UserStatus,     // Updated name
                        DB_User__LastUpdateDate: _nowDateTime.toISOString(),
                        DB_User__LastUpdateId: req.session.user.id
                    };

                    // 3. Optional: Handle Profile Image if a new one is uploaded
                    if (req.file) {
                        _updateData.DB_UserProfile = req.file.filename;
                    }

                    // 4. Call Model to execute UPDATE query
                    const result = await EmpModel.updateEmployee(empId, _updateData);

                    if (result.affectedRows > 0) {
                        res.json({ status: "success", message: "Employee Updated Successfully!" });
                    } else {
                        res.status(200).json({ status: "info", message: "No changes were made to the record." });
                    }

                } catch (err) {
                    console.error("Update Error:", err);
                    res.status(500).json({ status: "error", message: "Database Error: " + err.message });
                }
            },
        Change__Employee__Status: (req, res) => {
            res.json({ status: "success", message: "Status Changed" });
        }
    };

module.exports = Employee__Controller;