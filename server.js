const express = require("express");
const path = require("path");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/login")
    .then(() => {
      console.log("Database connected Successfully");
    })
    .catch(err => {
      console.log("Database connection error:", err);
    });

// Define the User model
const User = mongoose.model('Users', { username: String, email: String, password: String });

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Serve the HTML file
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Register User
app.post('/register', (req, res) => {
    const { username, email, password } = req.body;
    
    // Create a new user instance
    const newUser = new User({ username, email, password });
    
    // Save the user to the database
    newUser.save()
        .then(() => {
            console.log("User registered successfully");
            res.status(200).json({ message: 'User registered successfully' });
        })
        .catch(error => {
            console.error("Error registering user:", error);
            res.status(500).json({ message: 'An error occurred' });
        });
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email, password }).exec();
        if (user) {
            console.log("Login successful");
            res.status(200).json({ message: 'Login successful' });
        } else {
            console.log("Incorrect email or password");
            res.status(401).json({ message: 'Incorrect email or password' });
        }
    } catch (error) {
        console.error("Error logging in:", error);
        res.status(500).json({ message: 'An error occurred' });
    }
});

app.post('/update', async (req, res) => {
    const { email, password, newEmail, newPassword } = req.body;
    try {
        const user = await User.findOne({ email, password }).exec();
        if (user) {
            // Update user's email and password
            user.email = newEmail;
            user.password = newPassword;
            await user.save();
            console.log("User updated successfully");
            res.status(200).json({ message: 'User updated successfully' });
        } else {
            console.log("Incorrect email or password");
            res.status(401).json({ message: 'Incorrect email or password' });
        }
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ message: 'An error occurred' });
    }
});


app.post('/delete', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email, password }).exec();
        if (user) {
            // Delete user
            await User.deleteOne({ email, password });
            console.log("User deleted successfully");
            res.status(200).json({ message: 'User deleted successfully' });
        } else {
            console.log("Incorrect email or password");
            res.status(401).json({ message: 'Incorrect email or password' });
        }
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ message: 'An error occurred' });
    }
});

const port = 5000;
app.listen(port, () => {
  console.log(`Server running on Port: ${port}`);
});