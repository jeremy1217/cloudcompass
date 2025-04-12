// src/index.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const cloudRoutes = require('./routes/cloud');

// Initialize the app
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cloudcompass', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/cloud', cloudRoutes);

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../public')));

// Serve login page for both root and /login routes
app.get(['/', '/login'], (req, res) => {
    res.sendFile(path.join(__dirname, '../public/login.html'));
});

// Serve dashboard page
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/dashboard.html'));
});

// Serve admin pages
app.get('/admin/users', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/admin/users.html'));
});

app.get('/admin/status', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/admin/status.html'));
});

app.get('/admin/settings', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/admin/settings.html'));
});

// Serve cloud resources page
app.get('/admin/cloud', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/admin/cloud.html'));
});

// Start server
const PORT = process.env.PORT || 3030;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});