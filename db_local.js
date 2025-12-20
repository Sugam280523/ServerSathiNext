
const mysql = require('mysql2');
// 1. Create the connection configuration

// Create a connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '', // Default XAMPP password
  database: 'sathi__intergration',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Export the promise-based version for modern async/await usage
module.exports = pool.promise();