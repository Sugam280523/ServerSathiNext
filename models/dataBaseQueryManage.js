const db = require('../db');

const dataBaseQueryManage ={
    // Dynamic insert function
    insertData: async (tableName, dataArray) => {
        try {
            // Get columns and placeholders
            const columns = Object.keys(dataArray).join(', ');
            const values = Object.values(dataArray);
            const placeholders = values.map(() => '?').join(', ');

            const sql = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`;

            // Execute the query
            const [result] = await db.execute(sql, values);
            return result;
        } catch (error) {
            throw error;
        }
    },
    updateData: async (tableName, dataArray, idFieldName, idValue) => {
        try {
            // 1. Generate the SET clause: "column1 = ?, column2 = ?"
            const setClause = Object.keys(dataArray)
                .map(key => `${key} = ?`)
                .join(', ');

            // 2. Prepare the values array
            const values = Object.values(dataArray);
            
            // 3. Add the ID value to the end of the array for the WHERE clause
            values.push(idValue);

            // 4. Construct the SQL
            const sql = `UPDATE ${tableName} SET ${setClause} WHERE ${idFieldName} = ?`;

            // 5. Execute the query
            const [result] = await db.execute(sql, values);
            return result;
        } catch (error) {
            console.error("Database Update Error:", error);
            throw error;
        }
    }
};

module.exports = dataBaseQueryManage;