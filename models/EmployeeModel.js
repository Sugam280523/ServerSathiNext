const db = require('../db');

const EmployeeModel = {
    // Add new employee/user
    DB__Employee__Add: async (data) => {
        const [result] = await db.query('INSERT INTO db_tbl__userdetails SET ?', data);
        return result.insertId;
    },

    // Get all employees
    DB__Employee__Get: async () => {
        const [rows] = await db.query(
            'SELECT * FROM db_tbl__userdetails ORDER BY DB_User__CurrentDate DESC'
        );
        return rows;
    },

    // Get specific username by ID (Returns string or 'NA')
    getUserNameById: async (user_id) => {
        if (!user_id) return 'NA';
        
        const [rows] = await db.query(
            'SELECT DB_UserName FROM db_tbl__userdetails WHERE DB_UserId = ?', 
            [user_id]
        );
        
        return rows.length > 0 ? rows[0].DB_UserName : 'NA';
    },

    // Get employee by ID
    DB__Employee__Get__WithId: async (id) => {
        const [rows] = await db.query(
            'SELECT * FROM db_tbl__userdetails WHERE DB_UserId = ?', 
            [id]
        );
        return rows;
    },

    // Login Check / Get Employee by Email and Password
    DB__Employee__WithId__Get: async (email, password) => {
        const [rows] = await db.query(
            'SELECT * FROM db_tbl__userdetails WHERE DB_UserEmailId = ? AND DB_User__Password = ?', 
            [email, password]
        );
        return rows;
    },

    // Update Employee details
    DB__Employee__Update: async (id, data) => {
        const [result] = await db.query(
            'UPDATE db_tbl__userdetails SET ? WHERE DB_UserId = ?', 
            [data, id]
        );
        return result.affectedRows > 0;
    },

    /**
     * Get Partners based on Role
     * Note: In Node.js, we pass session data as arguments to the model
     */
    DB_GetAllPartners: async (userRole, userId) => {
        let sql = 'SELECT * FROM db_tbl__userdetails WHERE DB_UserRole = "Partner" AND DB_UserStatus = 1';
        let params = [];

        // Role-based logic
        if (!['Admin', 'SuperAdmin', 'User'].includes(userRole)) {
            // If not an admin/user, filter by the specific partner's ID
            sql += ' AND DB_UserId = ?';
            params.push(userId);
        }

        const [rows] = await db.query(sql, params);
        return rows;
    }
};

module.exports = EmployeeModel;