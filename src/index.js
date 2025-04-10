// src/index.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Import API routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');

// Initialize the app
const app = express();
const PORT = process.env.PORT || 3030;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve static files from the public directory
app.use(express.static('public'));

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cloudcompass');
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Start the application
const startApp = async () => {
  // Connect to database
  await connectDB();
  
  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/admin', adminRoutes);
  
  // Serve login page for both root and /login routes
  app.get(['/', '/login'], (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
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
  
  // Start server
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});

// Start the app
startApp();