const express = require('express');
const path = require('path');
const session = require('express-session');
const bcrypt = require('bcrypt');

// Import the database (initializes the database)
require('./api/database');

const app = express();
const PORT = 3000;

// Import the redirect_login routes
const redirectLoginRoutes = require('./api/redirect_login');

// Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// Use the redirect_login routes
app.use('/', redirectLoginRoutes);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});