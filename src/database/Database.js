// src/database/Database.js

class Database {
    constructor(mongoose) {
      this.mongoose = mongoose;
      this.initializeModels();
    }
  
    initializeModels() {
      // Define schemas
      const costMetricsSchema = new this.mongoose.Schema({
        timestamp: { type: Date, default: Date.now },
        aws: { type: Object },
        azure: { type: Object },
        gcp: { type: Object }
      });
  
      const performanceMetricsSchema = new this.mongoose.Schema({
        timestamp: { type: Date, default: Date.now },
        aws: { type: Object },
        azure: { type: Object },
        gcp: { type: Object }
      });
  
      const utilizationMetricsSchema = new this.mongoose.Schema({
        timestamp: { type: Date, default: Date.now },
        aws: { type: Object },
        azure: { type: Object },
        gcp: { type: Object }
      });
  
      const anomalySchema = new this.mongoose.Schema({
        timestamp: { type: Date, default: Date.now },
        metricType: { type: String, required: true },
        provider: { type: String, required: true },
        type: { type: String, required: true },
        service: { type: String },
        resourceId: { type: String },
        baseline: { type: Number },
        current: { type: Number },
        percentageIncrease: { type: Number },
        severity: { type: String, enum: ['low', 'medium', 'high'] },
        acknowledged: { type: Boolean, default: false },
        acknowledgedBy: { type: String },
        acknowledgedAt: { type: Date }
      });
  
      const optimizationOpportunitySchema = new this.mongoose.Schema({
        timestamp: { type: Date, default: Date.now },
        provider: { type: String, required: true },
        resourceType: { type: String, required: true },
        resourceId: { type: String, required: true },
        optimizationType: { type: String, required: true },
        description: { type: String },
        potentialSavings: { type: Number },
        priority: { type: String, enum: ['low', 'medium', 'high'] },
        status: { 
          type: String, 
          enum: ['open', 'in_progress', 'implemented', 'dismissed'],
          default: 'open'
        },
        statusUpdatedBy: { type: String },
        statusUpdatedAt: { type: Date },
        notes: { type: String }
      });
  
      const recommendationSchema = new this.mongoose.Schema({
        timestamp: { type: Date, default: Date.now },
        resourceId: { type: String, required: true },
        resourceType: { type: String, required: true },
        currentProvider: { type: String, required: true },
        recommendedProvider: { type: String, required: true },
        currentCost: { type: Number },
        estimatedSavings: { type: Number },
        confidenceScore: { type: String },
        reasoning: [{ type: String }],
        migrationComplexity: { type: Object },
        status: { 
          type: String, 
          enum: ['pending', 'approved', 'rejected', 'implemented'],
          default: 'pending'
        },
        statusUpdatedBy: { type: String },
        statusUpdatedAt: { type: Date },
        notes: { type: String }
      });
  
      const migrationPlanSchema = new this.mongoose.Schema({
        resourceId: { type: String, required: true },
        resourceType: { type: String, required: true },
        currentProvider: { type: String, required: true },
        targetProvider: { type: String, required: true },
        estimatedSavings: { type: Number },
        complexityLevel: { type: String },
        recommendedStrategy: { type: Object },
        alternativeStrategies: [{ type: Object }],
        migrationTooling: [{ type: Object }],
        estimatedTimeframe: { type: String },
        steps: [{ type: Object }],
        risks: [{ type: Object }],
        mitigations: [{ type: Object }],
        downtime: { type: Object },
        createdBy: { type: String },
        createdAt: { type: Date, default: Date.now },
        updatedBy: { type: String },
        updatedAt: { type: Date },
        status: { 
          type: String, 
          enum: ['created', 'in_progress', 'on_hold', 'completed', 'failed', 'cancelled'],
          default: 'created'
        },
        startedBy: { type: String },
        startedAt: { type: Date },
        completedAt: { type: Date },
        notes: { type: String },
        externalTaskId: { type: String },
        externalTaskUrl: { type: String }
      });
  
      const baselineSchema = new this.mongoose.Schema({
        type: { type: String, required: true, unique: true },
        data: { type: Object, required: true },
        lastUpdated: { type: Date, default: Date.now }
      });
  
      // Create models
      this.CostMetrics = this.mongoose.model('CostMetrics', costMetricsSchema);
      this.PerformanceMetrics = this.mongoose.model('PerformanceMetrics', performanceMetricsSchema);
      this.UtilizationMetrics = this.mongoose.model('UtilizationMetrics', utilizationMetricsSchema);
      this.Anomaly = this.mongoose.model('Anomaly', anomalySchema);
      this.OptimizationOpportunity = this.mongoose.model('OptimizationOpportunity', optimizationOpportunitySchema);
      this.Recommendation = this.mongoose.model('Recommendation', recommendationSchema);
      this.MigrationPlan = this.mongoose.model('MigrationPlan', migrationPlanSchema);
      this.Baseline = this.mongoose.model('Baseline', baselineSchema);
    }
  
    // Cost metrics methods
    async storeCostMetrics(metrics) {
      try {
        const costMetricsDoc = new this.CostMetrics(metrics);
        return await costMetricsDoc.save();
      } catch (error) {
        console.error('Error storing cost metrics:', error);
        throw error;
      }
    }
  
    async getLatestCostMetrics() {
      try {
        return await this.CostMetrics.findOne().sort({ timestamp: -1 });
      } catch (error) {
        console.error('Error getting latest cost metrics:', error);
        throw error;
      }
    }
  
    async getCostMetricsHistory(days = 30) {
      try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        
        return await this.CostMetrics.find({
          timestamp: { $gte: startDate }
        }).sort({ timestamp: 1 });
      } catch (error) {
        console.error('Error getting cost metrics history:', error);
        throw error;
      }
    }
  
    // Performance metrics methods
    async storePerformanceMetrics(metrics) {
      try {
        const performanceMetricsDoc = new this.PerformanceMetrics(metrics);
        return await performanceMetricsDoc.save();
      } catch (error) {
        console.error('Error storing performance metrics:', error);
        throw error;
      }
    }
  
    async getLatestPerformanceMetrics() {
      try {
        return await this.PerformanceMetrics.findOne().sort({ timestamp: -1 });
      } catch (error) {
        console.error('Error getting latest performance metrics:', error);
        throw error;
      }
    }
  
    // Utilization metrics methods
    async storeUtilizationMetrics(metrics) {
      try {
        const utilizationMetricsDoc = new this.UtilizationMetrics(metrics);
        return await utilizationMetricsDoc.save();
      } catch (error) {
        console.error('Error storing utilization metrics:', error);
        throw error;
      }
    }
  
    async getLatestUtilizationMetrics() {
      try {
        return await this.UtilizationMetrics.findOne().sort({ timestamp: -1 });
      } catch (error) {
        console.error('Error getting latest utilization metrics:', error);
        throw error;
      }
    }
  
    // Anomaly methods
    async storeAnomalies(anomalies, metricType) {
      try {
        const anomaliesWithType = anomalies.map(anomaly => ({
          ...anomaly,
          metricType
        }));
        
        return await this.Anomaly.insertMany(anomaliesWithType);
      } catch (error) {
        console.error('Error storing anomalies:', error);
        throw error;
      }
    }
  
    async getActiveAnomalies() {
      try {
        return await this.Anomaly.find({ acknowledged: false }).sort({ 
          severity: 1, // High severity first
          timestamp: -1 // Newest first
        });
      } catch (error) {
        console.error('Error getting active anomalies:', error);
        throw error;
      }
    }
  
    async updateAlertStatus(alertId, updates) {
      try {
        return await this.Anomaly.findByIdAndUpdate(alertId, updates, { new: true });
      } catch (error) {
        console.error('Error updating alert status:', error);
        throw error;
      }
    }
  
    // Optimization opportunity methods
    async storeOptimizationOpportunities(opportunities) {
      try {
        // Delete previous opportunities first (to avoid duplication)
        await this.OptimizationOpportunity.deleteMany({ 
          status: { $in: ['open', 'in_progress'] } 
        });
        
        return await this.OptimizationOpportunity.insertMany(opportunities);
      } catch (error) {
        console.error('Error storing optimization opportunities:', error);
        throw error;
      }
    }
  
    async getLatestOptimizationOpportunities() {
      try {
        return await this.OptimizationOpportunity.find({
          status: { $in: ['open', 'in_progress'] }
        }).sort({ 
          priority: 1, // High priority first
          potentialSavings: -1 // Highest savings first
        });
      } catch (error) {
        console.error('Error getting optimization opportunities:', error);
        throw error;
      }
    }
  
    async updateOptimizationOpportunity(opportunityId, updates) {
      try {
        return await this.OptimizationOpportunity.findByIdAndUpdate(
          opportunityId, 
          { ...updates, statusUpdatedAt: new Date() }, 
          { new: true }
        );
      } catch (error) {
        console.error('Error updating optimization opportunity:', error);
        throw error;
      }
    }
  
    // Recommendation methods
    async storeRecommendations(recommendations) {
      try {
        // Store each recommendation, overwriting existing recommendations for the same resource
        const operations = recommendations.map(recommendation => ({
          updateOne: {
            filter: { resourceId: recommendation.resourceId },
            update: { $set: { ...recommendation, timestamp: new Date() } },
            upsert: true
          }
        }));
        
        return await this.Recommendation.bulkWrite(operations);
      } catch (error) {
        console.error('Error storing recommendations:', error);
        throw error;
      }
    }
  
    async getRecommendations(filter = {}) {
      try {
        return await this.Recommendation.find(filter).sort({ estimatedSavings: -1 });
      } catch (error) {
        console.error('Error getting recommendations:', error);
        throw error;
      }
    }
  
    async updateRecommendationStatus(recommendationId, status, userId, notes = '') {
      try {
        return await this.Recommendation.findByIdAndUpdate(
          recommendationId, 
          { 
            status, 
            statusUpdatedBy: userId, 
            statusUpdatedAt: new Date(),
            notes
          }, 
          { new: true }
        );
      } catch (error) {
        console.error('Error updating recommendation status:', error);
        throw error;
      }
    }
  
    // Migration plan methods
    async saveMigrationPlan(migrationPlan) {
      try {
        const migrationPlanDoc = new this.MigrationPlan(migrationPlan);
        return await migrationPlanDoc.save();
      } catch (error) {
        console.error('Error saving migration plan:', error);
        throw error;
      }
    }
  
    async getMigrationPlans(filter = {}) {
      try {
        return await this.MigrationPlan.find(filter).sort({ createdAt: -1 });
      } catch (error) {
        console.error('Error getting migration plans:', error);
        throw error;
      }
    }
  
    async getMigrationPlan(planId) {
      try {
        return await this.MigrationPlan.findById(planId);
      } catch (error) {
        console.error('Error getting migration plan:', error);
        throw error;
      }
    }
  
    async updateMigrationPlan(planId, updates) {
      try {
        return await this.MigrationPlan.findByIdAndUpdate(
          planId, 
          { ...updates, updatedAt: new Date() }, 
          { new: true }
        );
      } catch (error) {
        console.error('Error updating migration plan:', error);
        throw error;
      }
    }
  
    async deleteMigrationPlan(planId) {
      try {
        return await this.MigrationPlan.findByIdAndDelete(planId);
      } catch (error) {
        console.error('Error deleting migration plan:', error);
        throw error;
      }
    }
  
    // Baseline methods
    async storeBaselineCostMetrics(metrics) {
      try {
        return await this.Baseline.findOneAndUpdate(
          { type: 'cost' },
          { data: metrics, lastUpdated: new Date() },
          { upsert: true, new: true }
        );
      } catch (error) {
        console.error('Error storing baseline cost metrics:', error);
        throw error;
      }
    }
  
    async getBaselineCostMetrics() {
      try {
        const baseline = await this.Baseline.findOne({ type: 'cost' });
        return baseline ? baseline.data : null;
      } catch (error) {
        console.error('Error getting baseline cost metrics:', error);
        throw error;
      }
    }
  
    async storeBaselinePerformanceMetrics(metrics) {
      try {
        return await this.Baseline.findOneAndUpdate(
          { type: 'performance' },
          { data: metrics, lastUpdated: new Date() },
          { upsert: true, new: true }
        );
      } catch (error) {
        console.error('Error storing baseline performance metrics:', error);
        throw error;
      }
    }
  
    async getBaselinePerformanceMetrics() {
      try {
        const baseline = await this.Baseline.findOne({ type: 'performance' });
        return baseline ? baseline.data : null;
      } catch (error) {
        console.error('Error getting baseline performance metrics:', error);
        throw error;
      }
    }
  }
  
  module.exports = Database;