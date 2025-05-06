const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = 3000;
const saltRounds = 10;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Database setup
const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

// Create the database tables if they do not exist
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS Users (
            user_id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            user_first TEXT NOT NULL,
            user_last TEXT NOT NULL,
            user_email TEXT UNIQUE,
            user_pass TEXT NOT NULL
        )`);

    db.run(`CREATE TABLE IF NOT EXISTS Mood_logs (
            mood_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            mood_value INTEGER NOT NULL,
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES Users(user_id)
        )`);

    db.run(`CREATE TABLE IF NOT EXISTS Journal (
            journal_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            journal_entry TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES Users(user_id)
        )`);

    db.run(`CREATE TABLE IF NOT EXISTS Quotes (
            quote_id INTEGER PRIMARY KEY AUTOINCREMENT,
            quote_text TEXT NOT NULL
        )`);

    db.run(`CREATE TABLE IF NOT EXISTS Points (
            point_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            point_earn INTEGER NOT NULL DEFAULT 0,
            FOREIGN KEY (user_id) REFERENCES Users(user_id)
        )`);
});

// Add some sample quotes if the table is empty
db.get("SELECT COUNT(*) as count FROM Quotes", (err, row) => {
    if (err) {
        console.error("Error checking quotes:", err);
        return;
    }
    if (row.count === 0) {
        const sampleQuotes = [
            "You're worth it!",
            "You matter!",
            "You're a good person!",
            "Every day is a new opportunity.",
            "You are capable of amazing things."
        ];
        
        const stmt = db.prepare("INSERT INTO Quotes (quote_text) VALUES (?)");
        sampleQuotes.forEach(quote => {
            stmt.run(quote);
        });
        stmt.finalize();
    }
});

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Signup route
app.post('/api/signup', async (req, res) => {
    const { username, user_first, user_last, user_email, user_pass } = req.body;

    if (!username || !user_first || !user_last || !user_email || !user_pass) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const hashedPassword = await bcrypt.hash(user_pass, saltRounds);
        
        db.run(
            `INSERT INTO Users (username, user_first, user_last, user_email, user_pass) 
             VALUES (?, ?, ?, ?, ?)`,
            [username, user_first, user_last, user_email, hashedPassword],
            function(err) {
                if (err) {
                    if (err.message.includes('UNIQUE constraint failed')) {
                        return res.status(400).json({ error: 'Username or email already exists' });
                    }
                    return res.status(500).json({ error: 'Database error' });
                }
                
                // Create a points record for the new user
                db.run(
                    `INSERT INTO Points (user_id, point_earn) VALUES (?, ?)`,
                    [this.lastID, 0],
                    (err) => {
                        if (err) {
                            console.error("Error creating points record:", err);
                        }
                    }
                );
                
                res.status(201).json({ message: 'User created successfully' });
            }
        );
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Login route
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    db.get(
        `SELECT user_id, username, user_pass FROM Users WHERE username = ?`,
        [username],
        async (err, user) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            if (!user) {
                return res.status(401).json({ error: 'Invalid username or password' });
            }

            try {
                const match = await bcrypt.compare(password, user.user_pass);
                if (match) {
                    res.json({ 
                        message: 'Login successful',
                        userId: user.user_id
                    });
                } else {
                    res.status(401).json({ error: 'Invalid username or password' });
                }
            } catch (error) {
                console.error(error);
                res.status(500).json({ error: 'Internal server error' });
            }
        }
    );
});

// Mood logging route
app.post('/api/mood', (req, res) => {
    const { userId, moodValue, notes } = req.body;

    if (!userId || !moodValue) {
        return res.status(400).json({ error: 'User ID and mood value are required' });
    }

    db.run(
        `INSERT INTO Mood_logs (user_id, mood_value, notes) VALUES (?, ?, ?)`,
        [userId, moodValue, notes || null],
        function(err) {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Failed to log mood' });
            }
            
            // Award points for mood logging
            db.run(
                `UPDATE Points SET point_earn = point_earn + 10 WHERE user_id = ?`,
                [userId],
                (err) => {
                    if (err) {
                        console.error("Error updating points:", err);
                    }
                }
            );
            
            res.json({ message: 'Mood logged successfully' });
        }
    );
});

// Journal entry route
app.post('/api/journal', (req, res) => {
    const { userId, entry } = req.body;

    if (!userId || !entry) {
        return res.status(400).json({ error: 'User ID and journal entry are required' });
    }

    db.run(
        `INSERT INTO Journal (user_id, journal_entry) VALUES (?, ?)`,
        [userId, entry],
        function(err) {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Failed to save journal entry' });
            }
            
            // Award points for journal entry
            db.run(
                `UPDATE Points SET point_earn = point_earn + 20 WHERE user_id = ?`,
                [userId],
                (err) => {
                    if (err) {
                        console.error("Error updating points:", err);
                    return res.status(500).json({ error: 'Journal saved but points not awarded' });
                    }
                }
            );
            
            res.json({ message: 'Journal entry saved successfully' });
        }
    );
});

// Get random quote
app.get('/api/quote', (req, res) => {
    db.get(
        `SELECT quote_text FROM Quotes ORDER BY RANDOM() LIMIT 1`,
        (err, row) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Failed to get quote' });
            }
            res.json({ quote: row ? row.quote_text : "Stay positive!" });
        }
    );
});

// Get user points
app.get('/api/points/:userId', (req, res) => {
    const userId = req.params.userId;

    db.get(
        `SELECT point_earn FROM Points WHERE user_id = ?`,
        [userId],
        (err, row) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Failed to get points' });
            }
            res.json({ points: row ? row.point_earn : 0 });
        }
    );
});

// Start server
app.listen(PORT, () => {
    console.log('\nServer is running on http://localhost:' + PORT + '\n');
});