// src/routes/recommendations.js
const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');

/**
 * @route   GET /api/recommendations
 * @desc    Get all recommendations
 * @access  Private
 */
router.get('/', auth, async (req, res) => {
  try {
    const { recommendationEngine } = req.services;
    
    // Generate recommendations
    const recommendations = await recommendationEngine.generateRecommendations();
    
    res.json(recommendations);
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   GET /api/recommendations/resource/:resourceId
 * @desc    Get recommendations for a specific resource
 * @access  Private
 */
router.get('/resource/:resourceId', auth, async (req, res) => {
  try {
    const { recommendationEngine } = req.services;
    const resourceId = req.params.resourceId;
    
    // Generate all recommendations
    const recommendations = await recommendationEngine.generateRecommendations();
    
    // Find the recommendation for the specified resource
    const resourceRecommendation = recommendations.resourceRecommendations.find(
      rec => rec.resourceId === resourceId
    );
    
    if (!resourceRecommendation) {
      return res.status(404).json({ message: 'Resource recommendation not found' });
    }
    
    res.json(resourceRecommendation);
  } catch (error) {
    console.error('Error fetching resource recommendation:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   GET /api/recommendations/strategy
 * @desc    Get the overall multi-cloud strategy
 * @access  Private
 */
router.get('/strategy', auth, async (req, res) => {
  try {
    const { recommendationEngine } = req.services;
    
    // Generate recommendations
    const recommendations = await recommendationEngine.generateRecommendations();
    
    // Return just the overall strategy
    res.json(recommendations.overallStrategy);
  } catch (error) {
    console.error('Error fetching strategy:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   POST /api/recommendations/generate
 * @desc    Generate new recommendations (force refresh)
 * @access  Private
 */
router.post('/generate', auth, async (req, res) => {
  try {
    const { recommendationEngine } = req.services;
    
    // Force regeneration of recommendations
    const recommendations = await recommendationEngine.generateRecommendations(true);
    
    res.json(recommendations);
  } catch (error) {
    console.error('Error generating recommendations:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   GET /api/recommendations/providers/:provider
 * @desc    Get recommendations filtered by current provider
 * @access  Private
 */
router.get('/providers/:provider', auth, async (req, res) => {
  try {
    const { recommendationEngine } = req.services;
    const provider = req.params.provider.toLowerCase();
    
    // Generate all recommendations
    const recommendations = await recommendationEngine.generateRecommendations();
    
    // Filter recommendations by provider
    const filteredRecommendations = recommendations.resourceRecommendations.filter(
      rec => rec.currentProvider === provider
    );
    
    res.json({
      resourceRecommendations: filteredRecommendations,
      overallStrategy: recommendations.overallStrategy
    });
  } catch (error) {
    console.error('Error fetching provider recommendations:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   GET /api/recommendations/savings
 * @desc    Get recommendation savings summary
 * @access  Private
 */
router.get('/savings', auth, async (req, res) => {
  try {
    const { recommendationEngine } = req.services;
    
    // Generate all recommendations
    const recommendations = await recommendationEngine.generateRecommendations();
    
    // Calculate savings summary
    const totalSavings = recommendations.resourceRecommendations.reduce(
      (sum, rec) => sum + (rec.estimatedSavings || 0), 
      0
    );
    
    // Group savings by provider transition
    const savingsByTransition = {};
    recommendations.resourceRecommendations.forEach(rec => {
      if (rec.currentProvider !== rec.recommendedProvider && rec.estimatedSavings > 0) {
        const key = `${rec.currentProvider}-to-${rec.recommendedProvider}`;
        savingsByTransition[key] = (savingsByTransition[key] || 0) + rec.estimatedSavings;
      }
    });
    
    // Group savings by resource type
    const savingsByResourceType = {};
    recommendations.resourceRecommendations.forEach(rec => {
      if (rec.estimatedSavings > 0) {
        savingsByResourceType[rec.resourceType] = (savingsByResourceType[rec.resourceType] || 0) + rec.estimatedSavings;
      }
    });
    
    res.json({
      totalMonthlySavings: totalSavings,
      totalAnnualSavings: totalSavings * 12,
      savingsByTransition,
      savingsByResourceType,
      topOpportunities: recommendations.resourceRecommendations
        .filter(rec => rec.estimatedSavings > 0)
        .sort((a, b) => b.estimatedSavings - a.estimatedSavings)
        .slice(0, 10)
    });
  } catch (error) {
    console.error('Error fetching savings summary:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   POST /api/recommendations/export
 * @desc    Export recommendations to CloudCostIQ
 * @access  Private
 */
router.post('/export', auth, async (req, res) => {
  try {
    const { recommendationEngine, cloudCostIQIntegration } = req.services;
    
    // Check if CloudCostIQ integration is available
    if (!cloudCostIQIntegration) {
      return res.status(400).json({ message: 'CloudCostIQ integration is not configured' });
    }
    
    // Generate recommendations
    const recommendations = await recommendationEngine.generateRecommendations();
    
    // Export to CloudCostIQ
    const exportResult = await cloudCostIQIntegration.exportRecommendations(recommendations);
    
    res.json(exportResult);
  } catch (error) {
    console.error('Error exporting recommendations:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;