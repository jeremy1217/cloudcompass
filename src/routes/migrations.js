// src/routes/migrations.js
const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');

/**
 * @route   POST /api/migrations/plan
 * @desc    Generate migration plan for a resource
 * @access  Private
 */
router.post('/plan', auth, async (req, res) => {
  try {
    const { migrationPlanner, recommendationEngine } = req.services;
    const { resourceId } = req.body;
    
    if (!resourceId) {
      return res.status(400).json({ message: 'Resource ID is required' });
    }
    
    // First get the recommendation for this resource
    const recommendations = await recommendationEngine.generateRecommendations();
    const resourceRecommendation = recommendations.resourceRecommendations.find(
      rec => rec.resourceId === resourceId
    );
    
    if (!resourceRecommendation) {
      return res.status(404).json({ message: 'Resource recommendation not found' });
    }
    
    // Generate migration plan
    const migrationPlan = migrationPlanner.generateMigrationPlan(resourceRecommendation);
    
    res.json(migrationPlan);
  } catch (error) {
    console.error('Error generating migration plan:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   GET /api/migrations/plans
 * @desc    Get all migration plans
 * @access  Private
 */
router.get('/plans', auth, async (req, res) => {
  try {
    const { database } = req.services;
    
    // Get all saved migration plans from database
    const migrationPlans = await database.getMigrationPlans();
    
    res.json(migrationPlans);
  } catch (error) {
    console.error('Error fetching migration plans:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   GET /api/migrations/plans/:planId
 * @desc    Get a specific migration plan
 * @access  Private
 */
router.get('/plans/:planId', auth, async (req, res) => {
  try {
    const { database } = req.services;
    const planId = req.params.planId;
    
    // Get the specified migration plan from database
    const migrationPlan = await database.getMigrationPlan(planId);
    
    if (!migrationPlan) {
      return res.status(404).json({ message: 'Migration plan not found' });
    }
    
    res.json(migrationPlan);
  } catch (error) {
    console.error('Error fetching migration plan:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   POST /api/migrations/plans
 * @desc    Save a migration plan
 * @access  Private
 */
router.post('/plans', auth, async (req, res) => {
  try {
    const { database } = req.services;
    const migrationPlan = req.body;
    
    if (!migrationPlan || !migrationPlan.resourceId) {
      return res.status(400).json({ message: 'Valid migration plan is required' });
    }
    
    // Add metadata
    migrationPlan.createdBy = req.user.id;
    migrationPlan.createdAt = new Date();
    migrationPlan.status = 'created';
    
    // Save the migration plan to database
    const savedPlan = await database.saveMigrationPlan(migrationPlan);
    
    res.json(savedPlan);
  } catch (error) {
    console.error('Error saving migration plan:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   PUT /api/migrations/plans/:planId
 * @desc    Update a migration plan
 * @access  Private
 */
router.put('/plans/:planId', auth, async (req, res) => {
  try {
    const { database } = req.services;
    const planId = req.params.planId;
    const updates = req.body;
    
    if (!updates) {
      return res.status(400).json({ message: 'Update data is required' });
    }
    
    // Update the migration plan in database
    const updatedPlan = await database.updateMigrationPlan(planId, updates);
    
    if (!updatedPlan) {
      return res.status(404).json({ message: 'Migration plan not found' });
    }
    
    res.json(updatedPlan);
  } catch (error) {
    console.error('Error updating migration plan:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   DELETE /api/migrations/plans/:planId
 * @desc    Delete a migration plan
 * @access  Private
 */
router.delete('/plans/:planId', auth, async (req, res) => {
  try {
    const { database } = req.services;
    const planId = req.params.planId;
    
    // Delete the migration plan from database
    const result = await database.deleteMigrationPlan(planId);
    
    if (!result) {
      return res.status(404).json({ message: 'Migration plan not found' });
    }
    
    res.json({ message: 'Migration plan deleted successfully' });
  } catch (error) {
    console.error('Error deleting migration plan:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   POST /api/migrations/execute/:planId
 * @desc    Start execution of a migration plan
 * @access  Private
 */
router.post('/execute/:planId', auth, async (req, res) => {
  try {
    const { database, cloudCostIQIntegration } = req.services;
    const planId = req.params.planId;
    
    // Get the migration plan from database
    const migrationPlan = await database.getMigrationPlan(planId);
    
    if (!migrationPlan) {
      return res.status(404).json({ message: 'Migration plan not found' });
    }
    
    // Update plan status
    const updatedPlan = await database.updateMigrationPlan(planId, { 
      status: 'in_progress',
      startedAt: new Date(),
      startedBy: req.user.id
    });
    
    // Create a task in CloudCostIQ if integration is available
    if (cloudCostIQIntegration) {
      try {
        const task = await cloudCostIQIntegration.createMigrationTask(migrationPlan);
        
        // Update plan with task reference
        await database.updateMigrationPlan(planId, {
          externalTaskId: task.id,
          externalTaskUrl: task.url
        });
      } catch (integrationError) {
        console.error('Error creating task in CloudCostIQ:', integrationError);
        // Continue execution even if integration fails
      }
    }
    
    res.json(updatedPlan);
  } catch (error) {
    console.error('Error executing migration plan:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   POST /api/migrations/update-status/:planId
 * @desc    Update status of a migration plan
 * @access  Private
 */
router.post('/update-status/:planId', auth, async (req, res) => {
  try {
    const { database } = req.services;
    const planId = req.params.planId;
    const { status, notes } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }
    
    // Validate status
    const validStatuses = ['created', 'in_progress', 'on_hold', 'completed', 'failed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    
    // Update plan status
    const updatedPlan = await database.updateMigrationPlan(planId, { 
      status,
      notes: notes || '',
      updatedAt: new Date(),
      updatedBy: req.user.id
    });
    
    if (!updatedPlan) {
      return res.status(404).json({ message: 'Migration plan not found' });
    }
    
    // If status is completed or failed, add completion time
    if (status === 'completed' || status === 'failed') {
      await database.updateMigrationPlan(planId, {
        completedAt: new Date()
      });
    }
    
    res.json(updatedPlan);
  } catch (error) {
    console.error('Error updating migration plan status:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   GET /api/migrations/strategies
 * @desc    Get available migration strategies
 * @access  Private
 */
router.get('/strategies', auth, (req, res) => {
  try {
    const { migrationPlanner } = req.services;
    
    // Return the available migration strategies
    res.json(migrationPlanner.migrationStrategies);
  } catch (error) {
    console.error('Error fetching migration strategies:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   GET /api/migrations/tools/:sourceProvider/:targetProvider
 * @desc    Get migration tools for specific provider pair
 * @access  Private
 */
router.get('/tools/:sourceProvider/:targetProvider', auth, (req, res) => {
  try {
    const { migrationPlanner } = req.services;
    const { sourceProvider, targetProvider } = req.params;
    
    const migrationRoute = `${sourceProvider}-to-${targetProvider}`;
    const tools = migrationPlanner.migrationTools[migrationRoute] || [];
    
    res.json(tools);
  } catch (error) {
    console.error('Error fetching migration tools:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;