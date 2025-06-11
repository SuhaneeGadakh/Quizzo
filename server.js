const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const bcrypt = require('bcrypt');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));
app.use(session({
    secret: 'quiz_app_secret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// MySQL Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'quiz_app'
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Home 1.html'));
});

// User Registration
app.post('/api/register', async (req, res) => {
    const { username, email, password, course } = req.body;
    
    try {
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Check if user already exists
        const [existingUsers] = await db.promise().query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        
        if (existingUsers.length > 0) {
            return res.status(400).json({ error: 'User already exists' });
        }
        
        // Insert new user
        await db.promise().query(
            'INSERT INTO users (username, email, password, course) VALUES (?, ?, ?, ?)',
            [username, email, hashedPassword, course]
        );
        
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// User Login
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    
    try {
        // Find user
        const [users] = await db.promise().query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        
        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const user = users[0];
        
        // Verify password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        // Set session
        req.session.user = {
            id: user.id,
            username: user.username,
            email: user.email,
            course: user.course
        };
        
        res.json({ message: 'Login successful', user: req.session.user });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Save Quiz Results
app.post('/api/quiz/results', async (req, res) => {
    try {
        const { username, subject, score, totalQuestions, correctAnswers } = req.body;
        
        if (!username || !subject || score === undefined || !totalQuestions || !correctAnswers) {
            return res.status(400).json({ 
                error: 'Missing required fields', 
                required: 'username, subject, score, totalQuestions, correctAnswers',
                received: JSON.stringify(req.body)
            });
        }
        
        console.log('Saving quiz results for user:', username, 'subject:', subject);
        
        // Get user ID from username
        const [userResult] = await db.promise().query('SELECT id FROM users WHERE username = ?', [username]);
        
        if (!userResult || userResult.length === 0) {
            return res.status(404).json({ error: 'User not found with username: ' + username });
        }
        
        const userId = userResult[0].id;
        console.log('Found user ID:', userId);
        
        // Insert the quiz result
        const insertResult = `
            INSERT INTO quiz_results (user_id, subject, score, total_questions, correct_answers, created_at)
            VALUES (?, ?, ?, ?, ?, NOW())`;
        
        await db.promise().query(insertResult, [userId, subject, score, totalQuestions, correctAnswers]);
        
        // Check if subject progress record exists
        const [existingProgress] = await db.promise().query(
            'SELECT * FROM subject_progress WHERE user_id = ? AND subject = ?',
            [userId, subject]
        );
        
        if (existingProgress && existingProgress.length > 0) {
            // Update existing record
            const updateProgress = `
                UPDATE subject_progress 
                SET 
                    total_attempts = total_attempts + 1,
                    total_correct = total_correct + ?,
                    total_questions = total_questions + ?
                WHERE user_id = ? AND subject = ?`;
            
            await db.promise().query(updateProgress, [
                correctAnswers, 
                totalQuestions, 
                userId, 
                subject
            ]);
        } else {
            // Create new record
            const insertProgress = `
                INSERT INTO subject_progress (user_id, subject, total_attempts, total_correct, total_questions, created_at)
                VALUES (?, ?, 1, ?, ?, NOW())`;
            
            await db.promise().query(insertProgress, [
                userId, 
                subject, 
                correctAnswers, 
                totalQuestions
            ]);
        }
        
        res.json({ 
            success: true, 
            message: 'Quiz results saved successfully'
        });
    } catch (error) {
        console.error('Error saving quiz results:', error);
        res.status(500).json({ 
            error: 'Failed to save quiz results', 
            details: error.message 
        });
    }
});

// Routes with session authentication (legacy)
app.get('/api/quiz/results/by-subject/:subject', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const { subject } = req.params;
    
    try {
        const [results] = await db.promise().query(
            'SELECT * FROM quiz_results WHERE user_id = ? AND subject = ? ORDER BY created_at DESC LIMIT 3',
            [req.session.user.id, subject]
        );
        
        res.json(results);
    } catch (error) {
        console.error('Error fetching quiz results:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get All Quiz Results for User (legacy)
app.get('/api/quiz/results/session-all', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    
    try {
        const [results] = await db.promise().query(
            'SELECT * FROM quiz_results WHERE user_id = ? ORDER BY created_at DESC',
            [req.session.user.id]
        );
        
        res.json(results);
    } catch (error) {
        console.error('Error fetching all quiz results:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get Leaderboard
app.get('/api/leaderboard/:subject', async (req, res) => {
    const { subject } = req.params;
    
    try {
        const [leaderboard] = await db.promise().query(`
            SELECT 
                u.username, 
                u.course, 
                ROUND(AVG((qr.correct_answers / qr.total_questions) * 100), 2) as average_score,
                SUM(qr.correct_answers) as total_correct,
                SUM(qr.total_questions) as total_attempted,
                COUNT(qr.id) as attempts
            FROM quiz_results qr
            JOIN users u ON qr.user_id = u.id
            WHERE qr.subject = ?
            GROUP BY u.id
            ORDER BY average_score DESC, total_correct DESC
            LIMIT 10
        `, [subject]);
        
        res.json(leaderboard);
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get User Feedback
app.get('/api/feedback', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    
    try {
        const [feedback] = await db.promise().query(
            'SELECT * FROM user_feedback WHERE user_id = ? ORDER BY created_at DESC',
            [req.session.user.id]
        );
        
        res.json(feedback);
    } catch (error) {
        console.error('Error fetching user feedback:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Save User Feedback
app.post('/api/feedback', async (req, res) => {
    try {
        const { userId, rating, comment } = req.body;
        
        if (!userId || !rating) {
            return res.status(400).json({ error: 'User ID and rating are required' });
        }
        
        console.log('Submitting feedback for user ID:', userId);
        
        const query = `
            INSERT INTO user_feedback (user_id, rating, comment, created_at)
            VALUES (?, ?, ?, NOW())`;
        
        await db.promise().query(query, [userId, rating, comment || '']);
        res.json({ success: true, message: 'Feedback submitted successfully' });
    } catch (error) {
        console.error('Error submitting feedback:', error);
        res.status(500).json({ error: 'Failed to submit feedback', details: error.message });
    }
});

// Get user ID from username
app.get('/api/users/id', async (req, res) => {
    try {
        const username = req.query.username;
        if (!username) {
            return res.status(400).json({ error: 'Username parameter is required' });
        }
        
        console.log('Looking up user ID for username:', username);
        
        const query = `SELECT id FROM users WHERE username = ?`;
        const [result] = await db.promise().query(query, [username]);
        
        if (!result || result.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json({ id: result[0].id });
    } catch (error) {
        console.error('Error looking up user ID:', error);
        res.status(500).json({ error: 'Failed to get user ID', details: error.message });
    }
});

// Get user's quiz results for dashboard - this is the main route being used
app.get('/api/quiz/results/all', async (req, res) => {
    try {
        const username = req.query.username;
        if (!username) {
            return res.status(400).json({ error: 'Username parameter is required' });
        }
        
        console.log('Fetching quiz results for user:', username);
        
        const query = `
            SELECT 
                qr.*,
                u.username,
                ROUND((qr.correct_answers / qr.total_questions) * 100, 2) as accuracy
            FROM quiz_results qr
            JOIN users u ON qr.user_id = u.id
            WHERE u.username = ?
            ORDER BY qr.created_at DESC`;
        
        const [results] = await db.promise().query(query, [username]);
        console.log(`Found ${results.length} quiz results for ${username}`);
        res.json(results || []);
    } catch (error) {
        console.error('Error fetching quiz results:', error);
        res.status(500).json({ error: 'Failed to fetch quiz results', details: error.message });
    }
});

// Get user's feedback
app.get('/api/feedback/:username', async (req, res) => {
    try {
        const username = req.params.username;
        if (!username) {
            return res.status(400).json({ error: 'Username parameter is required' });
        }
        
        console.log('Fetching feedback for user:', username);
        
        const query = `
            SELECT uf.*, u.username 
            FROM user_feedback uf
            JOIN users u ON uf.user_id = u.id
            WHERE u.username = ?
            ORDER BY uf.created_at DESC`;
        
        const [feedback] = await db.promise().query(query, [username]);
        console.log(`Found ${feedback.length} feedback entries for ${username}`);
        res.json(feedback || []);
    } catch (error) {
        console.error('Error fetching feedback:', error);
        res.status(500).json({ error: 'Failed to fetch feedback', details: error.message });
    }
});

// Submit new feedback
app.post('/api/user-feedback', async (req, res) => {
    try {
        const { userName, rating, comment } = req.body;
        if (!userName) {
            return res.status(400).json({ error: 'Username is required' });
        }
        
        console.log('Submitting feedback for user:', userName);
        
        // Check if user exists
        const [user] = await db.promise().query('SELECT id FROM users WHERE username = ?', [userName]);
        
        if (!user || user.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        const query = `INSERT INTO user_feedback (user_id, rating, comment) VALUES (?, ?, ?)`;
        await db.promise().query(query, [user[0].id, rating, comment]);
        
        console.log('Feedback submitted successfully');
        res.json({ message: 'Feedback submitted successfully' });
    } catch (error) {
        console.error('Error submitting feedback:', error);
        res.status(500).json({ error: 'Failed to submit feedback', details: error.message });
    }
});

// Get user's quiz analysis
app.get('/api/quiz/analysis/:username', async (req, res) => {
    try {
        const username = req.params.username;
        if (!username) {
            return res.status(400).json({ error: 'Username parameter is required' });
        }
        
        console.log('Fetching quiz analysis for user:', username);
        
        // First, check if the user exists
        const [userResult] = await db.promise().query('SELECT id FROM users WHERE username = ?', [username]);
        
        if (!userResult || userResult.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        const userId = userResult[0].id;
        console.log('Found user ID:', userId);
        
        // Check if subject_progress table exists and has data for this user
        const [progressCheck] = await db.promise().query(
            'SELECT COUNT(*) as count FROM subject_progress WHERE user_id = ?', 
            [userId]
        );
        
        console.log('Subject progress count:', progressCheck[0].count);
        
        if (progressCheck[0].count === 0) {
            // If no progress data exists, let's create it from quiz results
            console.log('No subject progress data found, generating from quiz results...');
            
            const [quizResults] = await db.promise().query(`
                SELECT 
                    subject, 
                    COUNT(*) as attempts,
                    SUM(correct_answers) as total_correct,
                    SUM(total_questions) as total_questions
                FROM quiz_results
                JOIN users ON quiz_results.user_id = users.id
                WHERE users.username = ?
                GROUP BY subject
            `, [username]);
            
            console.log('Generated quiz results data:', quizResults);
            
            // Insert these as subject progress records
            if (quizResults && quizResults.length > 0) {
                for (const result of quizResults) {
                    await db.promise().query(`
                        INSERT INTO subject_progress 
                            (user_id, subject, total_attempts, total_correct, total_questions)
                        VALUES (?, ?, ?, ?, ?)
                        ON DUPLICATE KEY UPDATE
                            total_attempts = VALUES(total_attempts),
                            total_correct = VALUES(total_correct),
                            total_questions = VALUES(total_questions)
                    `, [userId, result.subject, result.attempts, result.total_correct, result.total_questions]);
                }
                console.log('Created subject progress records from quiz results');
            }
        }
        
        // Now fetch the analysis data
        const query = `
            SELECT 
                sp.subject,
                sp.total_attempts,
                sp.total_correct,
                sp.total_questions,
                ROUND((sp.total_correct / NULLIF(sp.total_questions, 0)) * 100, 2) as accuracy,
                MAX(qr.created_at) as last_attempt
            FROM subject_progress sp
            JOIN users u ON sp.user_id = u.id
            LEFT JOIN quiz_results qr ON sp.user_id = qr.user_id AND sp.subject = qr.subject
            WHERE u.username = ?
            GROUP BY sp.subject, sp.total_attempts, sp.total_correct, sp.total_questions
            ORDER BY sp.subject`;
        
        const [analysis] = await db.promise().query(query, [username]);
        console.log(`Found ${analysis.length} subject records for ${username}`);
        
        // If no data found, return empty array instead of null
        res.json(analysis || []);
    } catch (error) {
        console.error('Error fetching quiz analysis:', error);
        res.status(500).json({ error: 'Failed to fetch quiz analysis', details: error.message });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
}); 