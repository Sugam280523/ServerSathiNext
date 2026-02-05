const express = require('express');
const cors = require('cors');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const path = require('path');

const app = express();
const db = require('./db');
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
    secret: 'Sugam280523', // Change this to a random string
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));
app.use(express.static('public'));
app.use('/public', express.static('public'));
app.use(express.static(path.join(__dirname, 'public')));


app.use(flash());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use((req, res, next) => {
    // req.flash() returns an array. [0] gets the first message string.
    const successArr = req.flash('success');
    const errorArr = req.flash('error');

    // If array has data, use the string, otherwise set to null
    res.locals.success = successArr.length > 0 ? successArr[0] : null;
    res.locals.error = errorArr.length > 0 ? errorArr[0] : null;
    
    // Also keep your user session available
    res.locals.user = req.session.user || null;
    next();
});
// Import Route Files
const homeRoutes = require('./routes/homeRoutes');
const customerRoutes = require('./routes/customerRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const nicRoutes = require('./routes/nicRoutes');
const misroutes =require('./routes/misroutes');

// Use Routes
app.use('/', homeRoutes);
app.use('/', customerRoutes); 
app.use('/', misroutes);
app.use('/', employeeRoutes);
app.use('/', nicRoutes);

// Change this in your app.js
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));