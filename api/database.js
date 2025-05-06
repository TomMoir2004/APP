const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Path to the SQLite database file
const dbPath = path.join(__dirname, '..', 'database.db');

// Create or open the database
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

// Function to run a query and return a promise
function runQuery(query) {
    return new Promise((resolve, reject) => {
        db.run(query, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

// Initialize tables
async function initializeDatabase() {
    console.log('Initializing database tables...');

    try {
        await runQuery(`
            CREATE TABLE IF NOT EXISTS Users (
                user_id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                user_first TEXT NOT NULL,
                user_last TEXT NOT NULL,
                user_email TEXT UNIQUE,
                user_pass TEXT NOT NULL
            )
        `);
        console.log('Users table created or already exists.');

        await runQuery(`
            CREATE TABLE IF NOT EXISTS Mood_logs (
                mood_id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                mood_value INTEGER NOT NULL,
                notes TEXT,
                FOREIGN KEY (user_id) REFERENCES Users(user_id)
            )
        `);
        console.log('Mood_logs table created or already exists.');

        await runQuery(`
            CREATE TABLE IF NOT EXISTS Journal (
                journal_id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                journal_entry TEXT,
                FOREIGN KEY (user_id) REFERENCES Users(user_id)
            )
        `);
        console.log('Journal table created or already exists.');

        await runQuery(`
            CREATE TABLE IF NOT EXISTS Quotes (
                quote_id INTEGER PRIMARY KEY AUTOINCREMENT,
                quote_text TEXT NOT NULL
            )
        `);
        console.log('Quotes table created or already exists.');

        await runQuery(`
            CREATE TABLE IF NOT EXISTS Points (
                point_id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                point_earn INTEGER NOT NULL DEFAULT 0,
                FOREIGN KEY (user_id) REFERENCES Users(user_id)
            )
        `);
        console.log('Points table created or already exists.');

        console.log('Database tables initialized.');
    } catch (err) {
        console.error('Error initializing database tables:', err.message);
    }
}

module.exports = { db, initializeDatabase };