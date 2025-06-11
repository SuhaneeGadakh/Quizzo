-- Create database
CREATE DATABASE IF NOT EXISTS quiz_app;
USE quiz_app;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    course VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Quiz results table
CREATE TABLE IF NOT EXISTS quiz_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    subject VARCHAR(50) NOT NULL,
    score INT NOT NULL,
    total_questions INT NOT NULL,
    correct_answers INT NOT NULL,
    time_taken INT DEFAULT 0,
    wrong_answers INT DEFAULT 0,
    date_taken TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- User feedback table
CREATE TABLE IF NOT EXISTS user_feedback (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    rating INT NOT NULL,
    comment TEXT,
    date_submitted TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Subject progress table
CREATE TABLE IF NOT EXISTS subject_progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    subject VARCHAR(50) NOT NULL,
    total_attempts INT DEFAULT 0,
    total_correct INT DEFAULT 0,
    total_questions INT DEFAULT 0,
    last_attempt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE KEY user_subject_idx (user_id, subject)
);

-- Insert sample quiz results
INSERT INTO quiz_results (user_id, subject, score, total_questions, correct_answers, time_taken, wrong_answers) VALUES
(1, 'DSA', 80, 10, 8, 45, 2),
(1, 'WP', 70, 10, 7, 50, 3),
(1, 'DAA', 90, 10, 9, 40, 1),
(2, 'DSA', 60, 10, 6, 55, 4),
(2, 'DBMS', 85, 10, 8, 48, 2);

-- Insert sample feedback
INSERT INTO user_feedback (user_id, rating, comment) VALUES
(1, 5, 'Great quiz app! Very helpful for my exam preparation.'),
(2, 4, 'Good content but could use more questions in the database section.');

-- Insert sample subject progress
INSERT INTO subject_progress (user_id, subject, total_attempts, total_correct, total_questions) VALUES
(1, 'DSA', 2, 16, 20),
(1, 'WP', 1, 7, 10),
(1, 'DAA', 1, 9, 10),
(2, 'DSA', 1, 6, 10),
(2, 'DBMS', 1, 8, 10);