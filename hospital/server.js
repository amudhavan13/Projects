const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const path = require('path'); // Import the path module

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); // Serve static files from the 'public' directory
app.use('/css', express.static(path.join(__dirname, 'css'))); // Serve static files from the 'css' directory
app.use('/img', express.static(path.join(__dirname, 'img'))); // Serve static files from the 'images' directory

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'mediconnect'
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to database:', err);
    return;
  }
  console.log('Database connection successful');
});

// Route for the root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html')); // Use path.join to construct file paths
});

// Route to serve the signup page
app.get('/signup.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

// Route to serve the login page
app.get('/log_in.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'log_in.html'));
});

// Route to handle signup form submission
app.post('/signup', (req, res) => {
  const { patientName, age, gender, address, email, password } = req.body;



  const sql = 'INSERT INTO patients (patientName, age, gender, address, email, password) VALUES (?, ?, ?, ?, ?, ?)';
  connection.query(sql, [patientName, age, gender, address, email, password], (error, results) => {
    if (error) {
      console.error('Error inserting data into database:', error);
      res.status(500).send('Error inserting data into database');
    } else {
      console.log('Data inserted successfully');
      // Redirect to the user login page after signup
      res.redirect('/user_login.html');
    }
  });
});

// Route to handle login form submission
app.post('/login', (req, res) => {
  const {patientName, email, password } = req.body;

  const sql = 'SELECT patientName, email, password FROM patients WHERE patientName = ? AND email = ? AND password = ?';
  connection.query(sql, [patientName, email, password], (error, results) => {
    if (error) {
      console.error('Error querying database:', error);
      res.status(500).send('Error querying database');
      return;
    }

    if (results.length === 0) {
      res.status(401).send('Invalid email or password');
      return;
    }

    const patient = results[0];
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });
});

// Route to handle admin login form submission
app.post('/admin', (req, res) => {
  const { patientName, password } = req.body;
  

  const sql = 'SELECT patientName, password FROM patients WHERE patientName = ? AND password = ?';
  connection.query(sql, [patientName, password], (error, results) => {
    if (error) {
      console.error('Error querying database:', error);
      res.status(500).send('Error querying database');
      return;
    }

    if (results.length === 0) {
      res.status(401).send('Invalid username or password');
      return;
    }

    const patient = results[0];
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
