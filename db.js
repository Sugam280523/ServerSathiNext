const mysql = require('mysql2/promise'); // <--- MUST have /promise//193.203.185.1

require('dotenv').config(); // Make sure to npm install dotenv

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: 3306,
    ssl: { rejectUnauthorized: false },
    waitForConnections: true,
    connectionLimit: 10,
    connectTimeout: 20000
});


/*  async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Database connected successfully!');
        connection.release(); // Always release the connection back to the pool
    } catch (err) {
        console.error('❌ Database connection failed:', err.message);
    }
}

testConnection(); */ 
module.exports = pool;