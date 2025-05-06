const express = require('express');
const path = require('path');
const session = require('express-session');
const bcrypt = require('bcrypt');

// Import the database and initialization function
const { initializeDatabase } = require('./api/database');

const app = express();
const PORT = 3000;

// Middleware to parse JSON request bodies
app.use(express.json());

// Import the redirect_login routes
const redirectLoginRoutes = require('./api/redirect_login');

// Import the login API
const loginRoutes = require('./api/login');

// Import the signup API
const signupRoutes = require('./api/signup');

// Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// Use the redirect_login routes
app.use('/', redirectLoginRoutes);

// Use the login API
app.use('/api', loginRoutes);

// Use the signup API
app.use('/api', signupRoutes);

// Initialize the database and start the server
initializeDatabase().then(() => {
    app.listen(PORT, () => {
        console.log('\nServer is running on http://localhost:' + PORT + '\n');
    });
}).catch((err) => {
    console.error('Failed to initialize the database:', err.message);
});