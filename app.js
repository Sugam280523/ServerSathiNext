const express = require('express');
const cors = require('cors');
const app = express();
const db = require('./db');
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
// Import Route Files
const homeRoutes = require('./routes/homeRoutes');
//const customerRoutes = require('./routes/customerRoutes');
//const employeeRoutes = require('./routes/employeeRoutes');
const nicRoutes = require('./routes/nicRoutes');

// Use Routes
app.use('/', homeRoutes);
//app.use('/', customerRoutes); // Using / to keep your exact CI URL structure
//app.use('/', employeeRoutes);
app.use('/', nicRoutes);


// Change this in your app.js
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));