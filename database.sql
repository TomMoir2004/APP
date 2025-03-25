DROP DATABASE IF EXISTS wellness;
CREATE DATABASE wellness;
USE wellness;

CREATE TABLE Users ( --Create user table :)
    user_id INT AUTO_INCREMENT PRIMARY KEY, --User ID
    username VARCHAR(50) NOT NULL UNIQUE, -- The Username 
    user_first VARCHAR(50) NOT NULL, -- The users first name
    user_last VARCHAR(50) NOT NULL, -- The users last name
    user_email VARCHAR(100) UNIQUE, -- the users email
    user_pass VARCHAR(255) NOT NULL -- The users password
)
CREATE TABLE Mood_logs ( -- create mood table :)
    mood_id INT AUTO_INCREMENT PRIMARY KEY, --mood id to link to user
    user_id INT NOT NULL, -- user id to link to mood id
    mood_value INT NOT NULL, -- mood value 1 to 5
    notes VARCHAR(255) -- Notes for the mood
    FOREIGN KEY (user_id) REFERENCES users(user_id)--link foreign key
)
CREATE TABLE journal (
    journal_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    journal_entry TEXT,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
    )
CREATE TABLE quotes (
    quote_id INT AUTO_INCREMENT PRIMARY KEY,
    quote_text TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
)
CREATE TABLE points (
    point_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    point_earn INT NOT NULL DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
)