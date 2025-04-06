// src/index.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import core components
const CloudDataCollector = require('./data-collection/CloudDataCollector');
const WorkloadClassifier = require('./intelligence/WorkloadClassifier');
const PricingAnalyzer = require('./intelligence/PricingAnalyzer');
const RecommendationEngine = require('./intelligence/RecommendationEngine');
const MigrationPlanner = require('./implementation/MigrationPlanner');
const ContinuousMonitor = require('./implementation/ContinuousMonitor');
const CloudCostIQIntegration = require('./integration/CloudCostIQIntegration');
const Database = require('./database/Database');

// Import API routes
const authRoutes = require('./routes/auth');
const resourceRoutes = require('./routes/resources');
const recommendationRoutes = require('./routes/recommendations');
const migrationRoutes = require('./routes/migrations');
const monitoringRoutes = require('./routes/monitoring');
const integrationRoutes = require('./routes/integrations');
const dashboardRoutes = require('./routes/dashboard');

// Initialize the app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Initialize services
const initializeServices = async () => {
  // Create database interface
  const database = new Database(mongoose);
  
  // Cloud provider configurations
  const config = {
    aws: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION || 'us-east-1'
    },
    azure: {
      subscriptionId: process.env.AZURE_SUBSCRIPTION_ID,
      tenantId: process.env.AZURE_TENANT_ID,
      clientId: process.env.AZURE_CLIENT_ID,
      clientSecret: process.env.AZURE_CLIENT_SECRET
    },
    gcp: {
      projectId: process.env.GCP_PROJECT_ID,
      keyFilename: process.env.GCP_KEY_FILENAME
    }
  };
  
  // Initialize components
  const cloudDataCollector = new CloudDataCollector(config);
  const workloadClassifier = new WorkloadClassifier();
  const pricingAnalyzer = new PricingAnalyzer(config);
  const recommendationEngine = new RecommendationEngine(cloudDataCollector, workloadClassifier, pricingAnalyzer);
  const migrationPlanner = new MigrationPlanner();
  const continuousMonitor = new ContinuousMonitor(config, database);
  
  // Initialize CloudCostIQ integration if credentials are provided
  let cloudCostIQIntegration = null;
  if (process.env.CLOUDCOSTIQ_API_KEY && process.env.CLOUDCOSTIQ_ORG_ID) {
    cloudCostIQIntegration = new CloudCostIQIntegration({
      apiKey: process.env.CLOUDCOSTIQ_API_KEY,
      organizationId: process.env.CLOUDCOSTIQ_ORG_ID,
      apiUrl: process.env.CLOUDCOSTIQ_API_URL || 'https://api.cloudcostiq.com/v1'
    });
    
    // Test the connection
    const connected = await cloudCostIQIntegration.checkConnection();
    if (connected) {
      console.log('Successfully connected to CloudCostIQ');
    } else {
      console.error('Failed to connect to CloudCostIQ');
    }
  }
  
  // Initialize continuous monitoring
  continuousMonitor.initialize();
  
  return {
    database,
    cloudDataCollector,
    workloadClassifier,
    pricingAnalyzer,
    recommendationEngine,
    migrationPlanner,
    continuousMonitor,
    cloudCostIQIntegration
  };
};

// Start the application
const startApp = async () => {
  // Connect to database
  await connectDB();
  
  // Initialize services
  const services = await initializeServices();
  
  // Add services to request object for routes to access
  app.use((req, res, next) => {
    req.services = services;
    next();
  });
  
  // Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/resources', resourceRoutes);
  app.use('/api/recommendations', recommendationRoutes);
  app.use('/api/migrations', migrationRoutes);
  app.use('/api/monitoring', monitoringRoutes);
  app.use('/api/integrations', integrationRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  
  // Serve static files from the React app
  app.use(express.static('client/build'));
  
  // Catch-all route for React app
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
  
  // Start server
  app.listen(PORT, () => {
    console.log(`Multi-Cloud Strategy Assistant server running on port ${PORT}`);
  });
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`Error: ${err.message}`);
  // Close server & exit process
  process.exit(1);
});

// Start the application
startApp();