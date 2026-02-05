// controllers/Customer__Controller.js
const { validationResult } = require('express-validator');
const EmpModel = require('../models/EmpModel'); // Import your model
const CustModel = require('../models/CustModel');
const _dataInsert = require('../models/dataBaseQueryManage');
const db = require('../db');
const Customer__Controller = {
    leadView: async (req, res) => {
        if (!req.session.user) {
            return res.redirect('/');
        }
        try {
            // Now 'await' will work perfectly
            const partners = await EmpModel.getAllPartners();
                // Clear flash messages into local variables
                const flashMessages = {
                    success: req.flash('success'),
                    error: req.flash('error')
                };
                
                    res.render('customer/lead', {
                    user: req.session.user, // Current logged in user
                    partners: partners,
                    messages: {
                        success: req.flash('success'),
                        error: req.flash('error')
                    },
                    formData: req.flash('formData')[0] || {}, // Re-populate form on error
                    errors: req.flash('errors')[0] || {}     // Validation messages
            });
        } catch (err) {
            console.error("Render Error:", err);
            res.status(500).send("Internal Server Error");
        }
    },
    register: async (req, res) => {
        const errors = validationResult(req);
    
        if (!errors.isEmpty()) {
            req.flash('errors', errors.mapped());
            req.flash('formData', req.body);
            
            // Instead of res.render, use redirect. 
            // This takes the user back to the GET leadView where partners ARE defined.
            return res.redirect('/lead'); 
        }
            

        try {
            if (!req.session || !req.session.user) {
                req.flash('error', 'Session expired. Please login again.');
                return res.redirect('/login'); // Or your login path
            }
            const _table = "db_tbl__customerdetails";
            const _nowDateTime = new Date();
           
                // Data received from request body
                const _userData = {
                    DB_Cust__Name: req.body.CustomerName ,
                    DB_Cust__FirmName: req.body.FirmName,
                    DB_Cust__Address: req.body.Address,
                    DB_Cust__MobileNo: req.body.mobilenumber,
                    DB_Cust__State: req.body.State,
                    DB_Cust__city: req.body.city,
                    DB_Cust__SerialKey: req.body.serialnumber,
                    DB_Cust__LicNo: '',
                    DB_ApiKey: '',
                    DB__clientsecret: '',
                    DBApiKey:'',
                    DB_Cust__ParntnerNo: req.body.partnerno,
                    DB_Cust__SathiCurrentStatus: 'Lead',
                    DB_Cust__SathiPaymentStatus: 'P',
                    DB_Cust__InstalltionDate: _nowDateTime.toISOString(),
                    DB_Cust__NextAMCDate: '',
                    DB_Cust__AMCExpired: '1',
                    DB_Cust__LeadDate: _nowDateTime.toISOString(),
                    DB_User__DemoDate: '',
                    DB_User__LetusActivationDate:'',
                    DB_Cust__UserId:  req.session.user.id,
                    DB_Cust__LastUpdateUserId:  req.session.user.id,
                    DB_Cust__LastUpdateDate: _nowDateTime.toISOString(),
                    DB_Cust__Status: 1
                };
                //console.log(_userData);
                // Pass table name and data to Model
                const result = await _dataInsert.insertData(_table, _userData);
                // 3. If successful, set flash message and redirect
               if (result) {
                    req.flash('success', 'Customer Registered Successfully!'); // Only set on success
                }
                res.redirect('/Lead');
           

            } catch (err) {
                // 4. Handle errors (Database errors, etc.)
                console.error("Registration Error:", err);
                req.flash('error', 'Database Error: ' + err.message);
                return res.redirect('/Lead');
        }
    },
    demoView: async (req, res) => {
            if (!req.session.user) return res.redirect('/');
            
            try {
                // Fetch all customers to populate the dropdown
                const customers = await CustModel.DB__Customer__Get__Lead();
                //console.log(customers);
                res.render('customer/demo', {
                    customerdata: customers,
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
        getCustomerById: async (req, res) => {
            try {
                const empId = req.params.id;
                const customer = await CustModel.DB__Customer__Check(empId);

                if (!customer) {
                    return res.status(404).json({ message: "Customert not found" });
                }

                res.json(customer);
            } catch (err) {
                console.error("Fetch Single customer Error:", err);
                res.status(500).json({ message: "Error retrieving customer data" });
            }
        },
        demoRegister : async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            req.flash('errors', errors.mapped());
            req.flash('formData', req.body);
            return res.redirect('/Demo');
        }
            const { CustomerID, CustLicNo, ApiKey, clientsecret } = req.body;
            const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
            const _nowDateTime = new Date();

            // Create a new date object for the AMC date
            const _nextAMCDate = new Date();
            // Add 10 days to the current date
            _nextAMCDate.setDate(_nowDateTime.getDate() + 10);
            const updatePayload = {
                DB_Cust__LicNo: CustLicNo,
                DB_ApiKey: ApiKey,
                DB__clientsecret: clientsecret,
                DB_Cust__SathiPaymentStatus: 'P',
                DB_Cust__SathiCurrentStatus: 'Demo',
                DB_Cust__NextAMCDate: _nextAMCDate.toISOString(),
                DB_User__DemoDate: now,
                DB_Cust__LastUpdateDate: now
            };
        try {
            // 2. Call your model function
            // Syntax: updateData(tableName, dataObject, idColumnName, idValue)
            await _dataInsert.updateData(
                'db_tbl__customerdetails', 
                updatePayload, 
                'DB_Cust__Id', 
                CustomerID
            );
            //console.log(updatePayload);
            req.flash('success', 'Demo Activated Successfully');
            res.redirect('/Demo');
        } catch (err) {
                req.flash('error', 'Database Error: ' + err.message);
                res.redirect('/Demo');
            }
        },
    activationView: async (req, res) => {
     if (!req.session.user) return res.redirect('/');
            
            try {
                // Fetch all customers to populate the dropdown
                const customers = await CustModel.DB__CustomerDemoActivation__Get();
                //console.log(customers);
                res.render('customer/activation', {
                    customerdata: customers,
                    messages: {
                        success: req.flash('success'),
                        error: req.flash('error')
                    },
                    formData: req.flash('formData')[0] || {},
                    errors: req.flash('errors')[0] || {},
                    user: req.session.user,
                    oldInput: {}
                });
            } catch (err) {
                res.status(500).send("Database Error");
            }
        },
        getCustomerByIdActivation: async (req, res) => {
            const custId = req.params.id;
    
                try {
                    const results = await CustModel.DB__Customer__Check_Activation(custId);
                    
                    if (results.length > 0) {
                        const data = results[0]; // This contains PartnerName and Total_Demo_Count
                        
                        res.json({
                            status: "Success",
                            data: data,
                            user_Role: req.session.user.role
                        });
                    } else {
                        res.status(404).json({ message: "Customer not found" });
                    }
                } catch (err) {
                    res.status(500).json({ message: "Error fetching data" });
                }
        },
        Customer__Demo__Extended : async (req, res) => {
            // 1. Check Session (Equivalent to !empty session userdata)
            if (!req.session.user) return res.redirect('/');

            const customer_id = req.body.DB_Cust__Id;
            const session_user_id = req.session.user.id;
            const _nowDateTime = new Date();
            // Create a new date object for the AMC date
            const _nextAMCDate = new Date();
            // Add 10 days to the current date
            _nextAMCDate.setDate(_nowDateTime.getDate() + 10);
         

            try {
                        const _table='db_tbl__demoextended';
                        const _userData={
                        DB_Cust__Id: customer_id,
                        DB_DemoEx__CurrentDate: _nowDateTime.toISOString().slice(0, 19).replace('T', ' '),
                        DB_DemoEx__UserId: req.session.user.id,
                        DB_DemoEx__Status:1
                        };
                        const _updatePayload= {
                        DB_Cust__LastUpdateUserId: req.session.user.id,
                        DB_Cust__LastUpdateDate: _nowDateTime.toISOString().slice(0, 19).replace('T', ' '),
                        DB_Cust__NextAMCDate: _nextAMCDate,
                        DB_Cust__AMCExpired: '1'
                        };
                        
                    const result = await _dataInsert.insertData(_table, _userData);
                    const result2= await _dataInsert.updateData('db_tbl__customerdetails',_updatePayload, 
                        'DB_Cust__Id',customer_id);
                if (result && result2) {
                return res.json({
                    success: true,
                    message: 'Customer Demo Extended successfully.'
                });
            } else {
                return res.json({
                    success: false,
                    message: 'Failed to update record or log history.'
                });
            }

            } catch (error) {
            
            res.status(500).json({ 
                success: false, 
                message: "Error processing the extension request." 
            });
        }
        },
        activationRegister : async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            req.flash('errors', errors.mapped());
            req.flash('formData', req.body);
            return res.redirect('/Activation');
        }
            
            const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
             const _nowDateTime = new Date();
            // Create a new date object for the AMC date
            const _nextAMCDate = new Date();
            // Add 10 days to the current date
            _nextAMCDate.setFullYear(_nowDateTime.getFullYear() + 1);
            
        try {
                        const _table='db_tbl__paymentdetails';
                        const _userData={
                        DB_Cust__Id: req.body.CustomerIDAct,
                        DB_Cust__PaymentMode: req.body.paymentMode,
                        DB_Cust__PaymentProof: req.body.PaymentProof,
                        DB_Cust__PaymentDate:now,
                        DB_Payment__Status:1,
                        DB_Cust__UserId:req.session.user.id
                        };
                        const _updatePayload= {
                        DB_Cust__SathiCurrentStatus:'Live',
                        DB_Cust__SathiPaymentStatus: 'R',
                        DB_Cust__LastUpdateUserId: req.session.user.id,
                        DB_User__LetusActivationDate: now,
                        DB_Cust__LastUpdateDate:now,
                        DB_Cust__NextAMCDate:_nextAMCDate.toISOString().slice(0, 19).replace('T', ' '),
                        DB_Cust__AMCExpired:'1'
                        };
                        
                    const result = await _dataInsert.insertData(_table, _userData);
                    const result2= await _dataInsert.updateData('db_tbl__customerdetails',_updatePayload, 
                        'DB_Cust__Id',req.body.CustomerIDAct);
               if (result && result2) {
                        req.flash('success', 'Customer Activation Successfully.');
                        return res.redirect('/Activation'); // Successful redirect
                    } else {
                        req.flash('error', 'Failed to update record or log history.');
                        return res.redirect('/Activation'); // Failure redirect
                    }
            }catch (err) {
                req.flash('error', 'Database Error: ' + err.message);
                res.redirect('/Activation');
            }
        },
        CustomerLead__Table: async (req, res) => {
        if (!req.session.user) return res.redirect('/');

        try {
           res.render('customer/leadtbl', { 
                user: req.session.user 
            });
        } catch (err) {
            console.error("Fetch Error:", err);
            res.status(500).send("Error fetching employees");
        }
    },
    LeadCustomer__Table__GetData : async (req, res) => {
                try {
                // DataTables sends data in req.body for POST or req.query for GET
                const params = req.body.draw ? req.body : req.query;

                const draw = parseInt(params.draw) || 1;
                const start = parseInt(params.start) || 0;
                const length = parseInt(params.length) || 10;
                const searchVal = params.search ? params.search.value : '';

                    const currentUser = req.session.user;
                // 1. Base Query Conditions
                let whereClause = " WHERE DB_Cust__SathiCurrentStatus = 'Lead' AND DB_Cust__Status != '0'";
                let queryParams = [];

                if (currentUser.role === 'Partner') {
                    whereClause += " AND DB_Cust__ParntnerNo = ?";
                    queryParams.push(currentUser.id);
                }
                // 2. Advanced Search (Global)
                if (searchVal) {
                    whereClause += ` AND (
                        DB_Cust__FirmName LIKE ? OR 
                        DB_Cust__Name LIKE ? OR
                        DB_Cust__Address LIKE ? OR
                        DB_Cust__MobileNo LIKE ? OR
                        DB_Cust__State LIKE ? OR 
                        DB_Cust__city LIKE ? OR 
                        DB_Cust__SerialKey LIKE ? OR 
                        DB_Cust__LicNo LIKE ?
                    )`;
                    const term = `%${searchVal}%`;
                    queryParams.push(term, term, term);
                }

                // 3. Multi-Column Filtering (Footer Search)
                if (params.columns) {
                    params.columns.forEach(col => {
                        if (col.search && col.search.value && col.data) {
                            // Security: Verify col.data matches allowed columns to prevent SQL Injection
                            whereClause += ` AND ${col.data} LIKE ?`;
                            queryParams.push(`%${col.search.value}%`);
                        }
                    });
                }

                // 4. Dynamic Sorting
                let orderClause = " ORDER BY DB_Cust__Id DESC"; // Default
                if (params.order && params.columns) {
                    const columnIndex = params.order[0].column;
                    const columnDir = params.order[0].dir; // 'asc' or 'desc'
                    const columnName = params.columns[columnIndex].data;
                    if (columnName) {
                        orderClause = ` ORDER BY ${columnName} ${columnDir === 'desc' ? 'DESC' : 'ASC'}`;
                    }
                }

                // 5. Execute Queries for Count
                    // recordsTotal must also be filtered for Partners so pagination is accurate
                    let totalSql = "SELECT COUNT(*) as total FROM db_tbl__customerdetails WHERE DB_Cust__SathiCurrentStatus = 'Lead' AND DB_Cust__Status != '0'";
                    let totalParams = [];
                    
                    if (currentUser.role === 'Partner') {
                        totalSql += " AND DB_Cust__ParntnerNo = ?";
                        totalParams.push(currentUser.id);
                    }

                    const [totalCount] = await db.query(totalSql, totalParams);
                    const [filteredCount] = await db.query("SELECT COUNT(*) as total FROM db_tbl__customerdetails" + whereClause, queryParams);
                
                const dataSql = `
                    SELECT c.*, u.DB_UserName as PartnerName 
                    FROM db_tbl__customerdetails c
                    LEFT JOIN db_tbl__userdetails u ON c.DB_Cust__ParntnerNo = u.DB_UserId
                    ${whereClause} 
                    ${orderClause} 
                    LIMIT ? OFFSET ?`;

                const [rows] = await db.query(dataSql, [...queryParams, length, start]);

                // 6. Data Transformation (Formatting)
                const processedData = rows.map(row => ({
                    ...row,
                    DB_Cust__Name: `
                                    <span class="fw-bold">${row.DB_Cust__Name}</span>
                                    <button type="button" 
                                            class="btn btn-link btn-sm p-0 ms-1" 
                                            onclick="editCustomerLead(${row.DB_Cust__Id})">
                                        <i class='fa fa-edit'></i>
                                    </button>`,
                    DB_Cust__ParntnerNo: row.PartnerName || '<span class="text-muted">System</span>',
                    DB_lead_Days: calculateLeadDays(row.DB_Cust__LeadDate),
                    DB_Cust__LeadDate: formatDate(row.DB_Cust__LeadDate)
                }));

                res.json({
                    draw,
                    recordsTotal: totalCount[0].total,
                    recordsFiltered: filteredCount[0].total,
                    data: processedData
                });

            } catch (err) {
                res.status(500).json({ error: "Internal Server Error", details: err.message });
            }
            },
            updateCustomerLead :  async (req, res) => {
            
            try {
                    // 1. Session Check
                    if (!req.session || !req.session.user) {
                        return res.status(401).json({ status: "error", message: "Session expired" });
                    }

                    const CustId = req.body.CustomerId; 
                    const _nowDateTime = new Date();

                    // 2. Prepare Data (Matching your HTML 'name' attributes)
                    const _updateData = {
                        DB_Cust__Name: req.body.CustomerName,
                        DB_Cust__FirmName: req.body.FirmName,
                        DB_Cust__Address: req.body.Address, // Updated name
                        DB_Cust__MobileNo: req.body.mobilenumber,   // Updated name
                        DB_Cust__State: req.body.State,         // Updated name
                        DB_Cust__city: req.body.city,     // Updated name
                        DB_Cust__SerialKey: req.body.serialnumber,
                        DB_Cust__LastUpdateUserId: req.session.user.id,
                        DB_Cust__LastUpdateDate:_nowDateTime.toISOString().slice(0, 19).replace('T', ' ')
                    };

                    

                    const result= await _dataInsert.updateData('db_tbl__customerdetails',_updateData, 
                        'DB_Cust__Id',CustId);
                if (result) {
                    // We send a JSON response instead of a redirect
                    return res.status(200).json({ 
                        status: "success", 
                        message: "Customer Updated Successfully." 
                    });
                } else {
                    // If the database update failed
                    return res.status(400).json({ 
                        status: "error", 
                        message: "Failed to update record." 
                    });
                }

                } catch (err) {
                    
                    res.status(500).json({ status: "error", message: "Database Error: " + err.message });
                }
        },
        CustomerDemo__Table: async (req, res) => {
            if (!req.session.user) return res.redirect('/');

            try {
                res.render('customer/demotbl', { 
                    user: req.session.user 
                });
            } catch (err) {
                console.error("Fetch Error:", err);
                res.status(500).send("Error fetching employees");
            }
        },
        DemoCustomer__Table__GetData : async (req, res) => {
                try {
                // DataTables sends data in req.body for POST or req.query for GET
                const params = req.body.draw ? req.body : req.query;

                const draw = parseInt(params.draw) || 1;
                const start = parseInt(params.start) || 0;
                const length = parseInt(params.length) || 10;
                const searchVal = params.search ? params.search.value : '';

                    const currentUser = req.session.user;
                // 1. Base Query Conditions
                let whereClause = " WHERE DB_Cust__SathiCurrentStatus = 'Demo' AND DB_Cust__Status != '0'";
                let queryParams = [];

                if (currentUser.role === 'Partner') {
                    whereClause += " AND DB_Cust__ParntnerNo = ?";
                    queryParams.push(currentUser.id);
                }
                // 2. Advanced Search (Global)
                if (searchVal) {
                    whereClause += ` AND (
                        DB_Cust__FirmName LIKE ? OR 
                        DB_Cust__Name LIKE ? OR
                        DB_Cust__Address LIKE ? OR
                        DB_Cust__MobileNo LIKE ? OR
                        DB_Cust__State LIKE ? OR 
                        DB_Cust__city LIKE ? OR 
                        DB_Cust__SerialKey LIKE ? OR 
                        DB_User__DemoDate LIKE ? OR 
                        u.DB_UserName LIKE ? OR
                        DB_Cust__LicNo LIKE ?
                    )`;
                    const term = `%${searchVal}%`;
                    queryParams.push(term, term, term);
                }

                // 3. Multi-Column Filtering (Footer Search)
                    if (params.columns) {
                        params.columns.forEach(col => {
                            if (col.search && col.search.value && col.data) {
                                let columnField = col.data;
                                
                                // MAP VIRTUAL DATA TO ACTUAL SQL COLUMNS
                                if (col.data === 'DB_Cust__ParntnerNo') {
                                    columnField = 'u.DB_UserName'; // Search partner by name, not ID
                                } else if (col.data === 'DB_lead_Days' || col.data === 'DB_Cust__LeadDate') {
                                    columnField = 'DB_User__DemoDate'; // Both date columns search the same field
                                }

                                whereClause += ` AND ${columnField} LIKE ?`;
                                queryParams.push(`%${col.search.value}%`);
                            }
                        });
                    }

                // 4. Dynamic Sorting
                let orderClause = " ORDER BY DB_Cust__Id DESC"; // Default
                if (params.order && params.columns) {
                    const columnIndex = params.order[0].column;
                    const columnDir = params.order[0].dir; // 'asc' or 'desc'
                    const columnName = params.columns[columnIndex].data;
                    if (columnName) {
                        orderClause = ` ORDER BY ${columnName} ${columnDir === 'desc' ? 'DESC' : 'ASC'}`;
                    }
                }

                // 5. Execute Queries for Count
                    // recordsTotal must also be filtered for Partners so pagination is accurate
                    let totalSql = "SELECT COUNT(*) as total FROM db_tbl__customerdetails WHERE DB_Cust__SathiCurrentStatus = 'Lead' AND DB_Cust__Status != '0'";
                    let totalParams = [];
                    
                    if (currentUser.role === 'Partner') {
                        totalSql += " AND DB_Cust__ParntnerNo = ?";
                        totalParams.push(currentUser.id);
                    }

                    const [totalCount] = await db.query(totalSql, totalParams);
                    const [filteredCount] = await db.query("SELECT COUNT(*) as total FROM db_tbl__customerdetails" + whereClause, queryParams);
                
                const dataSql = `
                    SELECT c.*, u.DB_UserName as PartnerName 
                    FROM db_tbl__customerdetails c
                    LEFT JOIN db_tbl__userdetails u ON c.DB_Cust__ParntnerNo = u.DB_UserId
                    ${whereClause} 
                    ${orderClause} 
                    LIMIT ? OFFSET ?`;

                const [rows] = await db.query(dataSql, [...queryParams, length, start]);

                // 6. Data Transformation (Formatting)
                const processedData = rows.map(row => {
                    // 1. Determine the License Number display based on Role
                    let licNoDisplay;
                    
                    // Note: Check if your role string is 'SuperAdmin' or 'Superadmin' (case sensitive)
                    if (currentUser.role === 'SuperAdmin' || currentUser.role === 'Superadmin') {
                        licNoDisplay = `
                            <span class="fw-bold">${row.DB_Cust__LicNo}</span>
                            <button type="button" 
                                    class="btn btn-link btn-sm p-0 ms-1" 
                                    onclick="editCustomerDemoKeyUpdate(${row.DB_Cust__Id})">
                                <i class='fa fa-edit'></i>
                            </button>`;
                    } else {
                        licNoDisplay = row.DB_Cust__LicNo;
                    }

                    // 2. Return the full object
                    return {
                        ...row,
                        DB_Cust__Name: `
                                    <span class="fw-bold">${row.DB_Cust__Name}</span>
                                    <button type="button" 
                                            class="btn btn-link btn-sm p-0 ms-1" 
                                            onclick="editCustomerDemo(${row.DB_Cust__Id},'${currentUser.role}')">
                                        <i class='fa fa-edit'></i>
                                    </button>`,
                        DB_Cust__ParntnerNo: row.PartnerName || '<span class="text-muted">System</span>',
                        DB_Cust__LicNo: licNoDisplay, // Use the variable we defined above
                        DB_lead_Days: calculateLeadDays(row.DB_User__DemoDate),
                        DB_Cust__LeadDate: row.DB_User__DemoDate
                    };
                });

                res.json({
                    draw,
                    recordsTotal: totalCount[0].total,
                    recordsFiltered: filteredCount[0].total,
                    data: processedData
                });

            } catch (err) {
                res.status(500).json({ error: "Internal Server Error", details: err.message });
            }
            },
            updateCustomerDemo :  async (req, res) => {
            
            try {
                    // 1. Session Check
                    if (!req.session || !req.session.user) {
                        return res.status(401).json({ status: "error", message: "Session expired" });
                    }

                    const CustId = req.body.CustomerId; 
                    const _nowDateTime = new Date();

                    // 2. Prepare Data (Matching your HTML 'name' attributes)
                    const _updateData = {
                        DB_Cust__LicNo: req.body.CustLicNo,
                        DB_ApiKey: req.body.ApiKey,
                        DB__clientsecret: req.body.clientsecret,
                        DB_Cust__LastUpdateUserId: req.session.user.id,
                        DB_Cust__LastUpdateDate:_nowDateTime.toISOString().slice(0, 19).replace('T', ' ')
                    };

                    

                    const result= await _dataInsert.updateData('db_tbl__customerdetails',_updateData, 
                        'DB_Cust__Id',CustId);
                if (result) {
                    // We send a JSON response instead of a redirect
                    return res.status(200).json({ 
                        status: "success", 
                        message: "Customer Updated Successfully." 
                    });
                } else {
                    // If the database update failed
                    return res.status(400).json({ 
                        status: "error", 
                        message: "Failed to update record." 
                    });
                }

                } catch (err) {
                    
                    res.status(500).json({ status: "error", message: "Database Error: " + err.message });
                }
        },
    CustomerActivation__Table: async (req, res) => {
        if (!req.session.user) return res.redirect('/');

        try {
            
            res.render('customer/activationtbl', { 
                user: req.session.user 
            });
        } catch (err) {
            console.error("Fetch Error:", err);
            res.status(500).send("Error fetching employees");
        }
    },
    ActivationCustomer__Table__GetData  : async (req, res) => {
                try {
                // DataTables sends data in req.body for POST or req.query for GET
                const params = req.body.draw ? req.body : req.query;

                const draw = parseInt(params.draw) || 1;
                const start = parseInt(params.start) || 0;
                const length = parseInt(params.length) || 10;
                const searchVal = params.search ? params.search.value : '';

                    const currentUser = req.session.user;
                // 1. Base Query Conditions
                let whereClause = " WHERE DB_Cust__SathiCurrentStatus = 'Live' AND DB_Cust__Status != '0' AND DB_User__LetusActivationDate >= DATE_SUB(NOW(), INTERVAL 15 DAY)";
                let queryParams = [];

                if (currentUser.role === 'Partner') {
                    whereClause += " AND DB_Cust__ParntnerNo = ?";
                    queryParams.push(currentUser.id);
                }
                // 2. Advanced Search (Global)
                if (searchVal) {
                    whereClause += ` AND (
                        DB_Cust__FirmName LIKE ? OR 
                        DB_Cust__Name LIKE ? OR
                        DB_Cust__Address LIKE ? OR
                        DB_Cust__MobileNo LIKE ? OR
                        DB_Cust__State LIKE ? OR 
                        DB_Cust__city LIKE ? OR 
                        DB_Cust__SerialKey LIKE ? OR 
                        DB_Cust__LeadDate LIKE ? OR 
                        DB_User__DemoDate LIKE ? OR 
                        DB_User__LetusActivationDate LIKE ? OR 
                        u.DB_UserName LIKE ? OR
                        DB_Cust__LicNo LIKE ?
                    )`;
                    const term = `%${searchVal}%`;
                    queryParams.push(term, term, term);
                }

                // 3. Multi-Column Filtering (Footer Search)
                    if (params.columns) {
                        params.columns.forEach(col => {
                            if (col.search && col.search.value && col.data) {
                                let columnField = col.data;
                                
                                // MAP VIRTUAL DATA TO ACTUAL SQL COLUMNS
                                if (col.data === 'DB_Cust__ParntnerNo') {
                                    columnField = 'u.DB_UserName'; // Search partner by name, not ID
                                } else if (col.data === 'DB_lead_Days' || col.data === 'DB_Cust__LeadDate') {
                                    columnField = 'DB_User__DemoDate'; // Both date columns search the same field
                                }

                                whereClause += ` AND ${columnField} LIKE ?`;
                                queryParams.push(`%${col.search.value}%`);
                            }
                        });
                    }

                // 4. Dynamic Sorting
                let orderClause = " ORDER BY DB_Cust__Id DESC"; // Default
                if (params.order && params.columns) {
                    const columnIndex = params.order[0].column;
                    const columnDir = params.order[0].dir; // 'asc' or 'desc'
                    const columnName = params.columns[columnIndex].data;
                    if (columnName) {
                        orderClause = ` ORDER BY ${columnName} ${columnDir === 'desc' ? 'DESC' : 'ASC'}`;
                    }
                }

                // 5. Execute Queries for Count
                    // recordsTotal must also be filtered for Partners so pagination is accurate
                    let totalSql = "SELECT COUNT(*) as total FROM db_tbl__customerdetails WHERE DB_Cust__SathiCurrentStatus = 'Live' AND DB_Cust__Status != '0'";
                    let totalParams = [];
                    
                    if (currentUser.role === 'Partner') {
                        totalSql += " AND DB_Cust__ParntnerNo = ?";
                        totalParams.push(currentUser.id);
                    }

                    const [totalCount] = await db.query(totalSql, totalParams);
                    const [filteredCount] = await db.query("SELECT COUNT(*) as total FROM db_tbl__customerdetails" + whereClause, queryParams);
                
                const dataSql = `
                    SELECT c.*, u.DB_UserName as PartnerName 
                    FROM db_tbl__customerdetails c
                    LEFT JOIN db_tbl__userdetails u ON c.DB_Cust__ParntnerNo = u.DB_UserId
                    ${whereClause} 
                    ${orderClause} 
                    LIMIT ? OFFSET ?`;

                const [rows] = await db.query(dataSql, [...queryParams, length, start]);

                // 6. Data Transformation (Formatting)
                const processedData = rows.map(row => {
                    // 1. Determine the License Number display based on Role
                    let licNoDisplay;
                    
                    // Note: Check if your role string is 'SuperAdmin' or 'Superadmin' (case sensitive)
                    if (currentUser.role === 'SuperAdmin' || currentUser.role === 'Superadmin') {
                        licNoDisplay = `
                            <span class="fw-bold">${row.DB_Cust__Name}</span>
                            <button type="button" 
                                    class="btn btn-link btn-sm p-0 ms-1" 
                                    onclick="editCustomerActivationDetails(${row.DB_Cust__Id},'${currentUser.role}')">
                                <i class='fa fa-edit'></i>
                            </button>`;
                    } else {
                        licNoDisplay = row.DB_Cust__Name;
                    }
                    // 2. Return the full object
                    return {
                        ...row,
                        DB_Cust__Name: licNoDisplay,
                        DB_Cust__ParntnerNo: row.PartnerName || '<span class="text-muted">System</span>',
                        DB_Cust__LicNo: row.DB_Cust__LicNo, // Use the variable we defined above
                        DB_lead_Days: calculateLeadDays(row.DB_User__LetusActivationDate),
                        DB_Cust__LeadDate: row.DB_User__DemoDate
                    };
                });

                res.json({
                    draw,
                    recordsTotal: totalCount[0].total,
                    recordsFiltered: filteredCount[0].total,
                    data: processedData
                });

            } catch (err) {
                res.status(500).json({ error: "Internal Server Error", details: err.message });
            }
            }
    // Add other functions as needed for your routes
};
function calculateLeadDays(date) {
    if (!date) return 'NA';
    const diff = Math.floor((new Date() - new Date(date)) / (1000 * 60 * 60 * 24));
    return `<span class="badge ${diff > 7 ? 'bg-danger' : 'bg-success'}">${diff} Days</span>`;
}

function formatDate(date) {
    if (!date) return 'NA';
    return new Date(date).toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
module.exports = Customer__Controller;