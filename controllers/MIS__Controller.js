// controllers/Customer__Controller.js
const { validationResult } = require('express-validator');
const EmpModel = require('../models/EmpModel'); // Import your model
const CustModel = require('../models/CustModel');
const _dataInsert = require('../models/dataBaseQueryManage');
const db = require('../db');
const MIS__Controller = {
    TotalLiveCustomer__Table: async (req, res) => {
        if (!req.session.user) return res.redirect('/');

        try {
            
            res.render('misReport/totallivecustomer', { 
                user: req.session.user 
            });
        } catch (err) {
            console.error("Fetch Error:", err);
            res.status(500).send("Error fetching employees");
        }
    },
    TotalLiveCustomerTable__GetData  : async (req, res) => {
                try {
                // DataTables sends data in req.body for POST or req.query for GET
                const params = req.body.draw ? req.body : req.query;

                const draw = parseInt(params.draw) || 1;
                const start = parseInt(params.start) || 0;
                const length = parseInt(params.length) || 10;
                const searchVal = params.search ? params.search.value : '';

                    const currentUser = req.session.user;
                // 1. Base Query Conditions
                let whereClause = " WHERE DB_Cust__SathiCurrentStatus = 'Live' AND DB_Cust__Status != '0' AND DB_Cust__AMCExpired != '0'";
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
            },
            AMCExpiredThirtyDays__Table: async (req, res) => {
            if (!req.session.user) return res.redirect('/');

            try {
                
                res.render('misReport/amcexpireddays', { 
                    user: req.session.user 
                });
            } catch (err) {
                console.error("Fetch Error:", err);
                res.status(500).send("Error fetching employees");
            }
        },
        AMCExpiredThirtyDaysT__GetData  : async (req, res) => {
                    try {
                    // DataTables sends data in req.body for POST or req.query for GET
                    const params = req.body.draw ? req.body : req.query;

                    const draw = parseInt(params.draw) || 1;
                    const start = parseInt(params.start) || 0;
                    const length = parseInt(params.length) || 10;
                    const searchVal = params.search ? params.search.value : '';

                        const currentUser = req.session.user;
                        const days = 30;
                    // 1. Base Query Conditions
                    let whereClause = ` WHERE DB_Cust__SathiCurrentStatus = 'Live' 
                    AND DB_Cust__Status != '0' 
                    AND DB_Cust__AMCExpired = '1'
                    AND DB_Cust__NextAMCDate >= CURDATE() 
                    AND DB_Cust__NextAMCDate <= DATE_ADD(CURDATE(), INTERVAL ${days} DAY)`;
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
                },
                AMCExpired__Table: async (req, res) => {
                    if (!req.session.user) return res.redirect('/');

                    try {
                        
                        res.render('misReport/amcexpiredcustomer', { 
                            user: req.session.user 
                        });
                    } catch (err) {
                        console.error("Fetch Error:", err);
                        res.status(500).send("Error fetching employees");
                    }
                },
                AMCExpiredT__GetData  : async (req, res) => {
                    try {
                    // DataTables sends data in req.body for POST or req.query for GET
                    const params = req.body.draw ? req.body : req.query;

                    const draw = parseInt(params.draw) || 1;
                    const start = parseInt(params.start) || 0;
                    const length = parseInt(params.length) || 10;
                    const searchVal = params.search ? params.search.value : '';

                        const currentUser = req.session.user;
                    // 1. Base Query Conditions
                    // Logic: Date is in the past AND AMCExpired is 0 (Expired)
                    let whereClause = ` WHERE DB_Cust__SathiCurrentStatus = 'Live' 
                        AND DB_Cust__Status != '0' 
                        AND DB_Cust__AMCExpired = '0'
                        AND DB_Cust__NextAMCDate < CURDATE()`;
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
                },
                TotalCustomer__Table: async (req, res) => {
                    if (!req.session.user) return res.redirect('/');

                    try {
                        
                        res.render('misReport/allcustomer', { 
                            user: req.session.user 
                        });
                    } catch (err) {
                        console.error("Fetch Error:", err);
                        res.status(500).send("Error fetching employees");
                    }
                },
                TotalCustomerTable__GetData  : async (req, res) => {
                    try {
                    // DataTables sends data in req.body for POST or req.query for GET
                    const params = req.body.draw ? req.body : req.query;

                    const draw = parseInt(params.draw) || 1;
                    const start = parseInt(params.start) || 0;
                    const length = parseInt(params.length) || 10;
                    const searchVal = params.search ? params.search.value : '';

                        const currentUser = req.session.user;
                    // 1. Base Query Conditions
                    let whereClause = " WHERE DB_Cust__Status != 0";
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
    return `<span class="badge bg-success">${diff} Days</span>`;
}

function formatDate(date) {
    if (!date) return 'NA';
    return new Date(date).toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
module.exports = MIS__Controller;