const express = require('express');
const bcrypt = require('bcrypt');
const { db } = require('./database');

const router = express.Router();

// Login API endpoint
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required.' });
    }

    // Query the database for the user
    const query = `SELECT user_pass FROM Users WHERE username = ?`;
    db.get(query, [username], (err, row) => {
        if (err) {
            console.error('Database error:', err.message);
            return res.status(500).json({ error: 'Internal server error.' });
        }

        if (!row) {
            return res.status(401).json({ error: 'Invalid username or password.' });
        }

        // Compare the provided password with the hashed password in the database
        bcrypt.compare(password, row.user_pass, (err, isMatch) => {
            if (err) {
                console.error('Bcrypt error:', err.message);
                return res.status(500).json({ error: 'Internal server error.' });
            }

            if (!isMatch) {
                return res.status(401).json({ error: 'Invalid username or password.' });
            }

            // Successful login
            res.status(200).json({ message: 'Login successful!' });
        });
    });
});

module.exports = router;