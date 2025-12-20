const mysql = require('mysql2/promise'); // Note the /promise suffix

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'srv1127.hstgr.io',
    user: process.env.DB_USER || 'u877420011_Sathi',
    password: process.env.DB_PASSWORD || 'Sugam@280523',
    database: process.env.DB_NAME || 'u877420011_Sathi',
    port: 3306,
    ssl: {
        rejectUnauthorized: false
    },
    waitForConnections: true,
    connectionLimit: 10
});

// This test block will now work correctly
pool.getConnection()
    .then(conn => {
        console.log("✅ SUCCESS: Connected to Hostinger MySQL");
        conn.release();
    })
    .catch(err => {
        console.error("❌ DATABASE CONNECTION ERROR:", err.message);
    });

module.exports = pool;