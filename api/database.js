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

// Initialize tables
db.serialize(() => {
    // Create Users table
    db.run(`
        CREATE TABLE IF NOT EXISTS Users (
            user_id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            user_first TEXT NOT NULL,
            user_last TEXT NOT NULL,
            user_email TEXT UNIQUE,
            user_pass TEXT NOT NULL
        )
    `);

    // Create Mood_logs table
    db.run(`
        CREATE TABLE IF NOT EXISTS Mood_logs (
            mood_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            mood_value INTEGER NOT NULL,
            notes TEXT,
            FOREIGN KEY (user_id) REFERENCES Users(user_id)
        )
    `);

    // Create Journal table
    db.run(`
        CREATE TABLE IF NOT EXISTS Journal (
            journal_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            journal_entry TEXT,
            FOREIGN KEY (user_id) REFERENCES Users(user_id)
        )
    `);

    // Create Quotes table
    db.run(`
        CREATE TABLE IF NOT EXISTS Quotes (
            quote_id INTEGER PRIMARY KEY AUTOINCREMENT,
            quote_text TEXT NOT NULL
        )
    `);

    // Create Points table
    db.run(`
        CREATE TABLE IF NOT EXISTS Points (
            point_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            point_earn INTEGER NOT NULL DEFAULT 0,
            FOREIGN KEY (user_id) REFERENCES Users(user_id)
        )
    `);

    console.log('Database tables initialized.');
});

module.exports = db;