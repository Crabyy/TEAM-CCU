const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: 'my-secret-key', resave: false, saveUninitialized: true }));

// MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', 
    database: 'teamccu', 
});

// Routes
app.get('/', (req, res) => {
    res.send('Welcome to the login and registration system!');
});

app.post('/register', async (req, res) => {
    const { email, username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    db.query('INSERT INTO users (email, username, password) VALUES (?, ?, ?)', [email, username, hashedPassword], (err) => {
        if (err) throw err;
        res.send('User registered successfully!');
    });
});

app.post('/login', async (req, res) => {
    const { username_or_email, password } = req.body;

    db.query('SELECT * FROM users WHERE username = ? OR email = ?', [username_or_email, username_or_email], async (err, results) => {
        if (err) throw err;

        if (results.length === 0) {
            res.send('User not found.');
        } else {
            const match = await bcrypt.compare(password, results[0].password);
            if (match) {
                req.session.user = results[0].username;
                res.send('Login successful!');
            } else {
                res.send('Incorrect password.');
            }
        }
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
