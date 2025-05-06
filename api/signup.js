const express = require('express');
const bcrypt = require('bcrypt');
const { db } = require('./database'); // Import the database connection

const router = express.Router();

// Signup API endpoint
router.post('/signup', (req, res) => {
    const { username, user_first, user_last, user_email, user_pass } = req.body;

    // Validate input fields
    if (!username || !user_first || !user_last || !user_email || !user_pass) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    // Hash the password
    const saltRounds = 10;
    bcrypt.hash(user_pass, saltRounds, (err, hashedPassword) => {
        if (err) {
            console.error('Error hashing password:', err.message);
            return res.status(500).json({ error: 'Internal server error.' });
        }

        // Insert the new user into the database
        const query = `
            INSERT INTO Users (username, user_first, user_last, user_email, user_pass)
            VALUES (?, ?, ?, ?, ?)
        `;
        db.run(query, [username, user_first, user_last, user_email, hashedPassword], function (err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(409).json({ error: 'Username or email already exists.' });
                }
                console.error('Database error:', err.message);
                return res.status(500).json({ error: 'Internal server error.' });
            }

            // Successful signup
            res.status(201).json({ message: 'User registered successfully!' });
        });
    });
});

module.exports = router;