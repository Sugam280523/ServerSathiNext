
const mysql = require('mysql2');
// 1. Create the connection configuration

// Create a connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'u877420011_Sathi',
  password: 'Sugam@280523', // Default XAMPP password
  database: 'u877420011_Sathi',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Export the promise-based version for modern async/await usage
module.exports = pool.promise();