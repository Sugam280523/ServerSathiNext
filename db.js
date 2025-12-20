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

// This will now print the SPECIFIC error message in your Render logs
pool.getConnection()
    .then(conn => {
        console.log("✅ DATABASE CONNECTED SUCCESSFULLY");
        conn.release();
    })
    .catch(err => {
        console.error("❌ DATABASE CONNECTION ERROR:", err.message); 
        // This 'err.message' is what we need to see in your next log
    });

module.exports = pool;