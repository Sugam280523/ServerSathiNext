const mysql = require('mysql2/promise'); // <--- MUST have /promise

require('dotenv').config(); // Make sure to npm install dotenv

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'srv1127.hstgr.io',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: 3306,
    ssl: { rejectUnauthorized: false },
    waitForConnections: true,
    connectionLimit: 10,
    connectTimeout: 20000
});



module.exports = pool;