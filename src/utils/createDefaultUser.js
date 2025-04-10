const mongoose = require('mongoose');
const User = require('../models/User');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const createDefaultUser = async () => {
  try {
    console.log('Connecting to MongoDB...');
    console.log('MongoDB URI:', process.env.MONGO_URI);
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB successfully');

    // Check if default admin user already exists
    console.log('Checking for existing admin user...');
    const existingAdmin = await User.findOne({ email: 'admin@cloudcompass.com' });
    if (existingAdmin) {
      console.log('Default admin user already exists with ID:', existingAdmin._id);
      await mongoose.disconnect();
      return;
    }

    // Create default admin user
    console.log('Creating new admin user...');
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@cloudcompass.com',
      password: 'admin123', // This will be hashed by the User model's pre-save middleware
      role: 'admin'
    });

    await adminUser.save();
    console.log('Default admin user created successfully with ID:', adminUser._id);
    
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error creating default admin user:', error);
    process.exit(1);
  }
};

// Run the script
createDefaultUser(); 