const mysql = require('mysql2/promise'); // <--- MUST have /promise

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'srv1127.hstgr.io',
    user: process.env.DB_USER || 'u877420011_Sathi',
    password: process.env.DB_PASSWORD || 'Sugam@280523',
    database: process.env.DB_NAME || 'u877420011_Sathi',
    port: 3306,
    ssl: {
        rejectUnauthorized: false // <--- REQUIRED for Hostinger remote
    },
    waitForConnections: true,
    connectionLimit: 10,
    connectTimeout: 15000 // Give it more time for the internet connection
});

// Detailed Test Block
(async () => {
    try {
        const connection = await pool.getConnection();
        console.log("✅ SUCCESS: Remote connection established!");
        connection.release();
    } catch (err) {
        console.error("❌ DB ERROR CODE:", err.code);
        console.error("❌ DB ERROR MESSAGE:", err.message);
    }
})();

module.exports = pool;