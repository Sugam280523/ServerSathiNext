const db = require('../db');

const CustModel = {
    // Add new customer
    DB__Customer__Add: async (data) => {
        const [result] = await db.query('INSERT INTO db_tbl__customerdetails SET ?', data);
        return result.insertId;
    },
// Check Serial Key
    DB__Customer__Check: async (id) => {
        const [rows] = await db.query('SELECT * FROM db_tbl__customerdetails WHERE DB_Cust__Id = ?', [id]);
        return rows;
    },
    DB__Customer__Check_Activation: async (id) => {
            try {
                const sql = `
                    SELECT 
                        T2.*, 
                        T3.DB_UserName AS PartnerName,
                        (
                            SELECT COUNT(*) 
                            FROM db_tbl__demoextended DE 
                            WHERE DE.DB_Cust__Id = T2.DB_Cust__Id
                        ) AS Total_Demo_Count
                    FROM db_tbl__customerdetails T2
                    LEFT JOIN db_tbl__userdetails T3 
                        ON T2.DB_Cust__ParntnerNo = T3.DB_UserId
                    WHERE T2.DB_Cust__Status != '0' 
                    AND T2.DB_Cust__Id = ?
                `;

                const [rows] = await db.query(sql, [id]);
                return rows; // Returns an array of results
            } catch (error) {
                console.error("Database Error in Check_Activation:", error);
                throw error;
            }
        },
  
    // Get all customers (Active)
    DB__Customer__Get: async () => {
        const [rows] = await db.query('SELECT * FROM db_tbl__customerdetails ORDER BY DB_Cust__Id DESC');
        return rows;
    },
    //get customer call to lead with demo page
    DB__Customer__Get__Lead: async() =>{
        const [rows] = await db.query("SELECT `DB_Cust__Id`,`DB_Cust__Name`,`DB_Cust__FirmName` FROM `db_tbl__customerdetails` WHERE `DB_Cust__SathiCurrentStatus`= 'Lead'");
        return rows;
    },
    DB__CustomerLeadDashboard__Get: async() => {
        const [rows] = await db.query(
            'SELECT * FROM db_tbl__customerdetails WHERE DB_Cust__SathiCurrentStatus IN (?) AND DB_Cust__Status != "0" ORDER BY DB_Cust__Id DESC',
            [['Lead']]
        );
        return rows.count;
    },
    // Get customers with Lead status ---updated code
        DB__CustomerDemoActivation__Get: async () => {
        const [rows] = await db.query(
            `SELECT * FROM db_tbl__customerdetails 
            WHERE DB_Cust__Status != "0" 
            AND DB_Cust__SathiCurrentStatus IN (?) 
            AND (
                (DB_Cust__SathiCurrentStatus = 'Demo' AND DB_Cust__AMCExpired IN ('0', '1')) 
                OR 
                (DB_Cust__SathiCurrentStatus = 'Live' AND DB_Cust__AMCExpired = '0')
            )
            ORDER BY DB_Cust__Id DESC`,
            [['Demo', 'Live']]
        );
        return rows;
    },

    // Check Serial Key
    DB__Customer__SerialKey__Check: async (serialnumber) => {
        const [rows] = await db.query('SELECT * FROM db_tbl__customerdetails WHERE DB_Cust__SerialKey = ?', [serialnumber]);
        return rows;
    },

    // Get AMC Expired
    DB__CustomerAMCExpired__Get: async () => {
        const today = new Date().toISOString().split('T')[0];
        const [rows] = await db.query(
            'SELECT * FROM db_tbl__customerdetails WHERE DB_Cust__NextAMCDate < ? AND DB_Cust__AMCExpired = "0" AND DB_Cust__Status != "0" ORDER BY DB_Cust__Id DESC',
            [today]
        );
        return rows;
    },

    // Payment Pending List
    DB__CustomerPaymentPending__Get: async () => {
        const [rows] = await db.query(
            'SELECT * FROM db_tbl__customerdetails WHERE DB_Cust__SathiPaymentStatus = "P" AND DB_Cust__SathiCurrentStatus IN (?) AND DB_Cust__Status != "0" ORDER BY DB_Cust__Id DESC',
            [['Live', 'Demo']]
        );
        return rows;
    },
// Payment Pending List count
    DB__CustomerPaymentPending__Get__Cnt: async () => {
    const [rows] = await db.query(
        `SELECT COUNT(*) as count 
         FROM db_tbl__customerdetails 
         WHERE DB_Cust__SathiPaymentStatus = "P" 
         AND DB_Cust__Status != "0"`
    );
    return rows[0].count;
        },
    // Specific Customer with Partner Name (Join)
    DB__Customer__Get__WithId: async (id) => {
        const [rows] = await db.query(
            `SELECT c.*, u.DB_UserName AS PartnerName 
             FROM db_tbl__customerdetails c 
             LEFT JOIN db_tbl__userdetails u ON u.DB_UserId = c.DB_Cust__ParntnerNo 
             WHERE c.DB_Cust__Id = ?`,
            [id]
        );
        return rows;
    },

    // Update Customer
    DB__Customer__Update: async (id, data) => {
        const [result] = await db.query('UPDATE db_tbl__customerdetails SET ? WHERE DB_Cust__Id = ?', [data, id]);
        return result.affectedRows > 0;
    },

    // --- DASHBOARD COUNT FUNCTIONS ---

    DB__CustomerLiveDashboard__Get: async () => {
        const [rows] = await db.query(
            'SELECT COUNT(*) as count FROM db_tbl__customerdetails WHERE DB_Cust__SathiCurrentStatus = "Live" AND DB_Cust__Status != "0"'
        );
        return rows[0].count;
    },

    DB__CustomerTodayLiveDashboard__Get: async () => {
        const today = new Date().toISOString().split('T')[0];
        const [rows] = await db.query(
            'SELECT COUNT(*) as count FROM db_tbl__customerdetails WHERE DB_Cust__SathiCurrentStatus = "Live" AND DB_Cust__InstalltionDate = ? AND DB_Cust__Status != "0"',
            [today]
        );
        return rows[0].count;
    },

    DB__CustomerAMCExpiredDashboardN__Get: async () => {
        const today = new Date().toISOString().split('T')[0];
        const [rows] = await db.query(
            'SELECT COUNT(*) as count FROM db_tbl__customerdetails WHERE DB_Cust__NextAMCDate < ? AND DB_Cust__AMCExpired = "0" AND DB_Cust__Status != "0"',
            [today]
        );
        return rows[0].count;
    },
    getDashboardStats: async () => {
        const today = new Date().toISOString().split('T')[0];
        
        // Run multiple counts at once for better performance
        const [live, lead, demo, amc] = await Promise.all([
            db.query('SELECT COUNT(*) as count FROM db_tbl__customerdetails WHERE DB_Cust__SathiCurrentStatus = "Live" AND DB_Cust__Status != "0"'),
            db.query('SELECT COUNT(*) as count FROM db_tbl__customerdetails WHERE DB_Cust__SathiCurrentStatus = "Lead" AND DB_Cust__Status != "0"'),
            db.query('SELECT COUNT(*) as count FROM db_tbl__customerdetails WHERE DB_Cust__SathiCurrentStatus = "Demo" AND DB_Cust__Status != "0"'),
            db.query('SELECT COUNT(*) as count FROM db_tbl__customerdetails WHERE DB_Cust__NextAMCDate < ? AND DB_Cust__AMCExpired = "0"', [today])
        ]);

        return {
            totalLive: live[0][0].count,
            totalLead: lead[0][0].count,
            totalDemo: demo[0][0].count,
            totalAMC: amc[0][0].count
        };
    },
    DB__CustomerTodayLiveDashboard__Get: async () => {
    const today = new Date().toISOString().split('T')[0];
    const [rows] = await db.query(
        'SELECT COUNT(*) as count FROM db_tbl__customerdetails WHERE DB_Cust__SathiCurrentStatus = "Live" AND DB_Cust__InstalltionDate = ? AND DB_Cust__Status != "0"',
        [today]
    );
        return rows[0].count;
    },
    
};

module.exports = CustModel;