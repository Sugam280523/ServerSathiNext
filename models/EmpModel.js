const db = require('../db');

const EmpModel = {
    getEmployeeWithId: async (email, password) => {
        const [rows] = await db.query(
            'SELECT * FROM db_tbl__userdetails WHERE DB_UserEmailId = ? AND DB_User__Password = ? AND DB_UserStatus = 1',
            [email, password]
        );
        return rows;
    },
    getEmployeeById: async (id) => {
        const [rows] = await db.query(
            'SELECT * FROM db_tbl__userdetails WHERE DB_UserId = ?',
            [id]
        );
        return rows[0]; // Return only the first matching employee
    },
    updateEmployee: async (id, updateData) => {
        const sql = `
            UPDATE db_tbl__userdetails 
            SET 
                DB_UserName = ?, 
                DB_UserEmailId = ?, 
                DB_UserMobileNo = ?, 
                DB_Designation = ?, 
                DB_UserRole = ?, 
                DB_User__LastUpdateDate = ?, 
                DB_User__LastUpdateId = ?, 
                DB_UserStatus = ?
            WHERE DB_UserId = ?`;

        const params = [
            updateData.DB_UserName,
            updateData.DB_UserEmailId,
            updateData.DB_UserMobileNo,
            updateData.DB_Designation,
            updateData.DB_UserRole,
            updateData.DB_User__LastUpdateDate,
            updateData.DB_User__LastUpdateId,
            updateData.DB_UserStatus,
            id
        ];

        const [result] = await db.query(sql, params);
        return result;
    },
    getAllEmployees: async () => {
        const [rows] = await db.query("SELECT * FROM db_tbl__userdetails ORDER BY DB_User__CurrentDate DESC");
        return rows;
    },
    getAllPartners: async () => {
        // We filter by 'Partner' role so the dropdown only shows relevant people
        const [rows] = await db.query(
            "SELECT DB_UserId, DB_UserName FROM db_tbl__userdetails WHERE DB_UserRole = 'Partner' AND DB_UserStatus = 1 ORDER BY DB_UserName ASC"
        );
        return rows;
    }
};

module.exports = EmpModel;