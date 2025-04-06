// src/routes/dashboard.js
const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');

/**
 * @route   GET /api/dashboard/overview
 * @desc    Get overview dashboard data
 * @access  Private
 */
router.get('/overview', auth, async (req, res) => {
  try {
    const { 
      cloudDataCollector, 
      recommendationEngine, 
      continuousMonitor 
    } = req.services;
    
    // Collect overview data in parallel
    const [resources, recommendations, alerts, optimizationSummary] = await Promise.all([
      // Get resource counts
      getResourceCounts(cloudDataCollector),
      
      // Get recommendation summary
      getRecommendationSummary(recommendationEngine),
      
      // Get active alerts
      continuousMonitor.getActiveAlerts(),
      
      // Get optimization summary
      continuousMonitor.getOptimizationSummary()
    ]);
    
    // Combine data for the dashboard
    const dashboardData = {
      resources,
      recommendations,
      alerts: {
        count: alerts.length,
        criticalCount: alerts.filter(alert => alert.severity === 'high').length,
        recent: alerts.slice(0, 5) // Get 5 most recent alerts
      },
      optimization: optimizationSummary
    };
    
    res.json(dashboardData);
  } catch (error) {
    console.error('Error getting dashboard overview:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   GET /api/dashboard/costs
 * @desc    Get cost dashboard data
 * @access  Private
 */
router.get('/costs', auth, async (req, res) => {
  try {
    const { 
      continuousMonitor, 
      cloudCostIQIntegration 
    } = req.services;
    
    // Get time period from query params
    const period = req.query.period || '30d'; // Default to 30 days
    
    // Get cost data based on source
    let costData;
    
    if (cloudCostIQIntegration) {
      // Use CloudCostIQ for cost data if integration is available
      try {
        costData = await cloudCostIQIntegration.importCostData({
          period
        });
      } catch (integrationError) {
        console.error('Error fetching cost data from CloudCostIQ:', integrationError);
        // Fall back to local data if integration fails
        costData = await getLocalCostData(continuousMonitor.database, period);
      }
    } else {
      // Use local data if integration is not available
      costData = await getLocalCostData(continuousMonitor.database, period);
    }
    
    // Get cost anomalies
    const costAnomalies = await continuousMonitor.database.getAnomalies({ metricType: 'cost' });
    
    // Combine data for the dashboard
    const dashboardData = {
      costs: costData,
      anomalies: costAnomalies
    };
    
    res.json(dashboardData);
  } catch (error) {
    console.error('Error getting cost dashboard:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   GET /api/dashboard/performance
 * @desc    Get performance dashboard data
 * @access  Private
 */
router.get('/performance', auth, async (req, res) => {
  try {
    const { 
      continuousMonitor 
    } = req.services;
    
    // Get time period from query params
    const period = req.query.period || '24h'; // Default to 24 hours
    
    // Get performance metrics
    const performanceData = await getPerformanceData(continuousMonitor.database, period);
    
    // Get performance anomalies
    const performanceAnomalies = await continuousMonitor.database.getAnomalies({ metricType: 'performance' });
    
    // Combine data for the dashboard
    const dashboardData = {
      performance: performanceData,
      anomalies: performanceAnomalies
    };
    
    res.json(dashboardData);
  } catch (error) {
    console.error('Error getting performance dashboard:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   GET /api/dashboard/optimization
 * @desc    Get optimization dashboard data
 * @access  Private
 */
router.get('/optimization', auth, async (req, res) => {
  try {
    const { 
      continuousMonitor,
      recommendationEngine 
    } = req.services;
    
    // Get optimization opportunities
    const opportunities = await continuousMonitor.database.getLatestOptimizationOpportunities();
    
    // Get recommendations
    const recommendations = await recommendationEngine.generateRecommendations();
    
    // Combine data for the dashboard
    const dashboardData = {
      opportunities: {
        count: opportunities.length,
        data: opportunities,
        summary: await continuousMonitor.getOptimizationSummary()
      },
      recommendations: {
        count: recommendations.resourceRecommendations.length,
        strategy: recommendations.overallStrategy,
        savings: calculateTotalSavings(recommendations.resourceRecommendations)
      }
    };
    
    res.json(dashboardData);
  } catch (error) {
    console.error('Error getting optimization dashboard:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   GET /api/dashboard/migrations
 * @desc    Get migrations dashboard data
 * @access  Private
 */
router.get('/migrations', auth, async (req, res) => {
  try {
    const { 
      database,
      recommendationEngine
    } = req.services;
    
    // Get migration plans
    const migrationPlans = await database.getMigrationPlans();
    
    // Get recommendations for resources without migration plans
    const recommendations = await recommendationEngine.generateRecommendations();
    
    // Filter recommendations to only include ones without existing migration plans
    const planResourceIds = migrationPlans.map(plan => plan.resourceId);
    const pendingMigrations = recommendations.resourceRecommendations.filter(
      rec => !planResourceIds.includes(rec.resourceId) && 
             rec.currentProvider !== rec.recommendedProvider
    );
    
    // Count plans by status
    const plansByStatus = {
      created: 0,
      in_progress: 0,
      completed: 0,
      failed: 0,
      cancelled: 0,
      on_hold: 0
    };
    
    migrationPlans.forEach(plan => {
      if (plansByStatus.hasOwnProperty(plan.status)) {
        plansByStatus[plan.status]++;
      }
    });
    
    // Combine data for the dashboard
    const dashboardData = {
      plans: {
        total: migrationPlans.length,
        byStatus: plansByStatus,
        recent: migrationPlans.slice(0, 5) // Get 5 most recent plans
      },
      pendingMigrations: {
        count: pendingMigrations.length,
        recommendations: pendingMigrations.slice(0, 10) // Get top 10 recommendations
      }
    };
    
    res.json(dashboardData);
  } catch (error) {
    console.error('Error getting migrations dashboard:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * Helper function to get resource counts
 */
async function getResourceCounts(cloudDataCollector) {
  const resources = await cloudDataCollector.collectAllResources();
  
  // Calculate counts by provider
  const counts = {
    total: 0,
    aws: 0,
    azure: 0,
    gcp: 0
  };
  
  // AWS resources
  if (resources.aws) {
    for (const resourceType of Object.keys(resources.aws)) {
      if (Array.isArray(resources.aws[resourceType])) {
        counts.aws += resources.aws[resourceType].length;
      } else if (resources.aws[resourceType].Reservations) {
        // Special handling for EC2 instances
        counts.aws += resources.aws[resourceType].Reservations.reduce(
          (sum, reservation) => sum + reservation.Instances.length, 0
        );
      }
    }
  }
  
  // Azure resources
  if (resources.azure) {
    for (const resourceType of Object.keys(resources.azure)) {
      if (Array.isArray(resources.azure[resourceType])) {
        counts.azure += resources.azure[resourceType].length;
      }
    }
  }
  
  // GCP resources
  if (resources.gcp) {
    for (const resourceType of Object.keys(resources.gcp)) {
      if (Array.isArray(resources.gcp[resourceType])) {
        counts.gcp += resources.gcp[resourceType].length;
      }
    }
  }
  
  counts.total = counts.aws + counts.azure + counts.gcp;
  
  return counts;
}

/**
 * Helper function to get recommendation summary
 */
async function getRecommendationSummary(recommendationEngine) {
  const recommendations = await recommendationEngine.generateRecommendations();
  
  // Calculate counts and savings
  const summary = {
    total: recommendations.resourceRecommendations.length,
    crossCloudMigrations: 0,
    totalSavings: {
      monthly: 0,
      yearly: 0
    }
  };
  
  recommendations.resourceRecommendations.forEach(rec => {
    if (rec.currentProvider !== rec.recommendedProvider) {
      summary.crossCloudMigrations++;
    }
    
    if (rec.estimatedSavings) {
      summary.totalSavings.monthly += rec.estimatedSavings;
    }
  });
  
  summary.totalSavings.yearly = summary.totalSavings.monthly * 12;
  
  return summary;
}

/**
 * Helper function to get local cost data
 */
async function getLocalCostData(database, period) {
  let days = 30;
  
  // Parse period string
  if (period.endsWith('d')) {
    days = parseInt(period);
  } else if (period.endsWith('w')) {
    days = parseInt(period) * 7;
  } else if (period.endsWith('m')) {
    days = parseInt(period) * 30;
  } else if (period.endsWith('y')) {
    days = parseInt(period) * 365;
  }
  
  // Get cost metrics history
  const costHistory = await database.getCostMetricsHistory(days);
  
  // Format data for dashboard
  const formattedData = {
    byProvider: {},
    byService: {},
    trend: []
  };
  
  // Process cost history
  costHistory.forEach(entry => {
    // Add to trend data
    formattedData.trend.push({
      date: entry.timestamp,
      aws: entry.aws?.totalCost || 0,
      azure: entry.azure?.totalCost || 0,
      gcp: entry.gcp?.totalCost || 0,
      total: (entry.aws?.totalCost || 0) + (entry.azure?.totalCost || 0) + (entry.gcp?.totalCost || 0)
    });
    
    // Process AWS costs
    if (entry.aws) {
      // By provider
      if (!formattedData.byProvider.aws) {
        formattedData.byProvider.aws = 0;
      }
      formattedData.byProvider.aws += entry.aws.totalCost || 0;
      
      // By service
      if (entry.aws.serviceBreakdown) {
        for (const [service, cost] of Object.entries(entry.aws.serviceBreakdown)) {
          if (!formattedData.byService[service]) {
            formattedData.byService[service] = 0;
          }
          formattedData.byService[service] += cost;
        }
      }
    }
    
    // Process Azure costs
    if (entry.azure) {
      // By provider
      if (!formattedData.byProvider.azure) {
        formattedData.byProvider.azure = 0;
      }
      formattedData.byProvider.azure += entry.azure.totalCost || 0;
      
      // By service
      if (entry.azure.serviceBreakdown) {
        for (const [service, cost] of Object.entries(entry.azure.serviceBreakdown)) {
          if (!formattedData.byService[service]) {
            formattedData.byService[service] = 0;
          }
          formattedData.byService[service] += cost;
        }
      }
    }
    
    // Process GCP costs
    if (entry.gcp) {
      // By provider
      if (!formattedData.byProvider.gcp) {
        formattedData.byProvider.gcp = 0;
      }
      formattedData.byProvider.gcp += entry.gcp.totalCost || 0;
      
      // By service
      if (entry.gcp.serviceBreakdown) {
        for (const [service, cost] of Object.entries(entry.gcp.serviceBreakdown)) {
          if (!formattedData.byService[service]) {
            formattedData.byService[service] = 0;
          }
          formattedData.byService[service] += cost;
        }
      }
    }
  });
  
  return formattedData;
}

/**
 * Helper function to get performance data
 */
async function getPerformanceData(database, period) {
  // Get the latest performance metrics
  const performanceMetrics = await database.getLatestPerformanceMetrics();
  
  if (!performanceMetrics) {
    return {
      compute: [],
      database: [],
      storage: []
    };
  }
  
  // Format data for the dashboard
  const formattedData = {
    compute: [],
    database: [],
    storage: []
  };
  
  // Process AWS compute metrics
  if (performanceMetrics.aws && performanceMetrics.aws.compute) {
    performanceMetrics.aws.compute.forEach(instance => {
      formattedData.compute.push({
        provider: 'aws',
        resourceId: instance.instanceId,
        cpu: instance.cpu?.average || 0,
        memory: instance.memory?.average || 0,
        networkIn: instance.networkIn?.average || 0,
        networkOut: instance.networkOut?.average || 0
      });
    });
  }
  
  // Process Azure compute metrics
  if (performanceMetrics.azure && performanceMetrics.azure.compute) {
    performanceMetrics.azure.compute.forEach(instance => {
      formattedData.compute.push({
        provider: 'azure',
        resourceId: instance.instanceId,
        cpu: instance.cpu?.average || 0,
        memory: instance.memory?.average || 0,
        networkIn: instance.networkIn?.average || 0,
        networkOut: instance.networkOut?.average || 0
      });
    });
  }
  
  // Process GCP compute metrics
  if (performanceMetrics.gcp && performanceMetrics.gcp.compute) {
    performanceMetrics.gcp.compute.forEach(instance => {
      formattedData.compute.push({
        provider: 'gcp',
        resourceId: instance.instanceId,
        cpu: instance.cpu?.average || 0,
        memory: instance.memory?.average || 0,
        networkIn: instance.networkIn?.average || 0,
        networkOut: instance.networkOut?.average || 0
      });
    });
  }
  
  // Database and storage metrics would be processed similarly...
  
  return formattedData;
}

/**
 * Helper function to calculate total savings
 */
function calculateTotalSavings(recommendations) {
  const savings = {
    monthly: 0,
    annual: 0
  };
  
  recommendations.forEach(rec => {
    if (rec.estimatedSavings) {
      savings.monthly += rec.estimatedSavings;
    }
  });
  
  savings.annual = savings.monthly * 12;
  
  return savings;
}

module.exports = router;