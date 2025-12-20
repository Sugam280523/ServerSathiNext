const mysql = require('mysql2');

// Use a Connection Pool for better performance and stability
const pool = mysql.createPool({
  // 1. Change 'localhost' to your Hostinger Hostname or IP from your screenshot
  host: 'srv1127.hstgr.io', 
  
  // 2. Ensure these match your Hostinger Database User and Name
  user: 'u877420011_Sathi',
  password: 'Sugam@280523', 
  database: 'u877420011_Sathi',
  
  // 3. Port for MySQL is always 3306
  port: 3306,

  // 4. ADD SSL: This is required for remote connections to Hostinger
  ssl: {
    rejectUnauthorized: false
  },

  // 5. Connection Management
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000 // Increases wait time for remote connection latency
});

// Export the promise-based version
module.exports = pool.promise();