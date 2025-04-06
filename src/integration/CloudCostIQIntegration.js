// src/integration/CloudCostIQIntegration.js

const axios = require('axios');

class CloudCostIQIntegration {
  constructor(config) {
    this.config = config;
    this.apiUrl = config.apiUrl || 'https://api.cloudcostiq.com/v1';
    this.apiKey = config.apiKey;
    this.organizationId = config.organizationId;
    
    // Initialize axios instance with default headers
    this.client = axios.create({
      baseURL: this.apiUrl,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'X-Organization-ID': this.organizationId
      }
    });
  }

  /**
   * Import cost data from CloudCostIQ into the Multi-Cloud Strategy Assistant
   * @param {Object} params - Query parameters for cost data
   * @returns {Promise<Object>} - Cost data from CloudCostIQ
   */
  async importCostData(params = {}) {
    try {
      const defaultParams = {
        startDate: this.getDateString(30), // Default to 30 days ago
        endDate: this.getDateString(0),    // Today
        groupBy: 'provider',
        interval: 'day'
      };
      
      const queryParams = { ...defaultParams, ...params };
      
      const response = await this.client.get('/costs', {
        params: queryParams
      });
      
      return this.transformCostData(response.data);
    } catch (error) {
      console.error('Error importing cost data from CloudCostIQ:', error);
      throw new Error(`CloudCostIQ integration error: ${error.message}`);
    }
  }

  /**
   * Transform cost data from CloudCostIQ format to Multi-Cloud Strategy Assistant format
   * @param {Object} costData - Cost data from CloudCostIQ
   * @returns {Object} - Transformed cost data
   */
  transformCostData(costData) {
    // Initialize result structure
    const result = {
      totalCost: 0,
      byProvider: {},
      byService: {},
      byDay: {},
      byResource: {}
    };
    
    // Process the data
    if (costData && costData.data && Array.isArray(costData.data)) {
      for (const entry of costData.data) {
        // Add to total cost
        result.totalCost += entry.cost || 0;
        
        // Group by provider
        const provider = entry.provider?.toLowerCase() || 'unknown';
        if (!result.byProvider[provider]) {
          result.byProvider[provider] = 0;
        }
        result.byProvider[provider] += entry.cost || 0;
        
        // Group by service
        const service = entry.service || 'unknown';
        if (!result.byService[service]) {
          result.byService[service] = 0;
        }
        result.byService[service] += entry.cost || 0;
        
        // Group by day
        const day = entry.date || this.getDateString(0);
        if (!result.byDay[day]) {
          result.byDay[day] = {
            total: 0,
            byProvider: {}
          };
        }
        result.byDay[day].total += entry.cost || 0;
        
        if (!result.byDay[day].byProvider[provider]) {
          result.byDay[day].byProvider[provider] = 0;
        }
        result.byDay[day].byProvider[provider] += entry.cost || 0;
        
        // Group by resource
        if (entry.resourceId) {
          if (!result.byResource[entry.resourceId]) {
            result.byResource[entry.resourceId] = {
              cost: 0,
              provider: provider,
              service: service,
              region: entry.region || 'unknown',
              tags: entry.tags || {}
            };
          }
          result.byResource[entry.resourceId].cost += entry.cost || 0;
        }
      }
    }
    
    // Convert byDay to array format for easier charting
    const byDayArray = Object.keys(result.byDay).map(date => ({
      date,
      ...result.byDay[date]
    }));
    result.costTrend = byDayArray.sort((a, b) => a.date.localeCompare(b.date));
    
    return result;
  }

  /**
   * Import resource data from CloudCostIQ into the Multi-Cloud Strategy Assistant
   * @returns {Promise<Object>} - Resource data from CloudCostIQ
   */
  async importResourceData() {
    try {
      const response = await this.client.get('/resources');
      
      return this.transformResourceData(response.data);
    } catch (error) {
      console.error('Error importing resource data from CloudCostIQ:', error);
      throw new Error(`CloudCostIQ integration error: ${error.message}`);
    }
  }

  /**
   * Transform resource data from CloudCostIQ format to Multi-Cloud Strategy Assistant format
   * @param {Object} resourceData - Resource data from CloudCostIQ
   * @returns {Object} - Transformed resource data
   */
  transformResourceData(resourceData) {
    // Initialize result structure
    const result = {
      aws: {},
      azure: {},
      gcp: {}
    };
    
    // Process the data
    if (resourceData && resourceData.data && Array.isArray(resourceData.data)) {
      for (const resource of resourceData.data) {
        const provider = resource.provider?.toLowerCase();
        
        if (!provider || !['aws', 'azure', 'gcp'].includes(provider)) {
          continue;
        }
        
        const resourceType = resource.resourceType || 'unknown';
        
        if (!result[provider][resourceType]) {
          result[provider][resourceType] = [];
        }
        
        result[provider][resourceType].push({
          resourceId: resource.resourceId,
          name: resource.name,
          region: resource.region,
          createdAt: resource.createdAt,
          lastModifiedAt: resource.lastModifiedAt,
          tags: resource.tags || {},
          cost: {
            last30Days: resource.cost?.last30Days || 0,
            last7Days: resource.cost?.last7Days || 0,
            yesterday: resource.cost?.yesterday || 0
          },
          metrics: resource.metrics || {}
        });
      }
    }
    
    return result;
  }

  /**
   * Import budget data from CloudCostIQ
   * @returns {Promise<Object>} - Budget data from CloudCostIQ
   */
  async importBudgets() {
    try {
      const response = await this.client.get('/budgets');
      
      return response.data;
    } catch (error) {
      console.error('Error importing budget data from CloudCostIQ:', error);
      throw new Error(`CloudCostIQ integration error: ${error.message}`);
    }
  }

  /**
   * Import cost anomalies detected by CloudCostIQ
   * @param {number} days - Number of days to look back for anomalies
   * @returns {Promise<Object>} - Anomaly data from CloudCostIQ
   */
  async importCostAnomalies(days = 30) {
    try {
      const response = await this.client.get('/anomalies', {
        params: {
          startDate: this.getDateString(days),
          endDate: this.getDateString(0)
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error importing anomalies from CloudCostIQ:', error);
      throw new Error(`CloudCostIQ integration error: ${error.message}`);
    }
  }

  /**
   * Import reservation/commitment recommendations from CloudCostIQ
   * @returns {Promise<Object>} - Recommendation data from CloudCostIQ
   */
  async importCommitmentRecommendations() {
    try {
      const response = await this.client.get('/recommendations/commitments');
      
      return response.data;
    } catch (error) {
      console.error('Error importing commitment recommendations from CloudCostIQ:', error);
      throw new Error(`CloudCostIQ integration error: ${error.message}`);
    }
  }

  /**
   * Import rightsizing recommendations from CloudCostIQ
   * @returns {Promise<Object>} - Recommendation data from CloudCostIQ
   */
  async importRightsizingRecommendations() {
    try {
      const response = await this.client.get('/recommendations/rightsizing');
      
      return response.data;
    } catch (error) {
      console.error('Error importing rightsizing recommendations from CloudCostIQ:', error);
      throw new Error(`CloudCostIQ integration error: ${error.message}`);
    }
  }

  /**
   * Export multi-cloud recommendations to CloudCostIQ
   * @param {Object} recommendations - Recommendations from Multi-Cloud Strategy Assistant
   * @returns {Promise<Object>} - Response from CloudCostIQ
   */
  async exportRecommendations(recommendations) {
    try {
      // Transform recommendations to CloudCostIQ format
      const formattedRecommendations = this.formatRecommendationsForCloudCostIQ(recommendations);
      
      // Send recommendations to CloudCostIQ
      const response = await this.client.post('/external-recommendations', formattedRecommendations);
      
      return response.data;
    } catch (error) {
      console.error('Error exporting recommendations to CloudCostIQ:', error);
      throw new Error(`CloudCostIQ integration error: ${error.message}`);
    }
  }

  /**
   * Format multi-cloud recommendations for CloudCostIQ
   * @param {Object} recommendations - Recommendations from Multi-Cloud Strategy Assistant
   * @returns {Object} - Formatted recommendations for CloudCostIQ
   */
  formatRecommendationsForCloudCostIQ(recommendations) {
    const result = {
      source: 'Multi-Cloud Strategy Assistant',
      generatedAt: new Date().toISOString(),
      recommendations: []
    };
    
    // Process resource recommendations
    if (recommendations.resourceRecommendations && Array.isArray(recommendations.resourceRecommendations)) {
      for (const rec of recommendations.resourceRecommendations) {
        // Only include cross-provider recommendations
        if (rec.currentProvider !== rec.recommendedProvider) {
          result.recommendations.push({
            resourceId: rec.resourceId,
            resourceType: rec.resourceType,
            currentProvider: rec.currentProvider,
            recommendedProvider: rec.recommendedProvider,
            recommendationType: 'cross-cloud-migration',
            reason: rec.reasoning?.join('; ') || 'Cost optimization',
            estimatedSavings: rec.estimatedSavings || 0,
            confidenceScore: rec.confidenceScore || '0%',
            complexity: rec.migrationComplexity?.level || 'Medium'
          });
        }
      }
    }
    
    return result;
  }

  /**
   * Create a task in CloudCostIQ for a migration recommendation
   * @param {Object} migrationPlan - Migration plan from Multi-Cloud Strategy Assistant
   * @returns {Promise<Object>} - Response from CloudCostIQ
   */
  async createMigrationTask(migrationPlan) {
    try {
      // Format the migration plan as a task
      const task = {
        title: `Migrate ${migrationPlan.resourceId} from ${migrationPlan.currentProvider.toUpperCase()} to ${migrationPlan.targetProvider.toUpperCase()}`,
        description: `Migration plan for resource ${migrationPlan.resourceId} using ${migrationPlan.recommendedStrategy?.name} approach.`,
        taskType: 'migration',
        priority: migrationPlan.estimatedSavings > 100 ? 'high' : 'medium',
        estimatedSavings: migrationPlan.estimatedSavings,
        estimatedEffort: this.estimateEffort(migrationPlan),
        steps: this.formatMigrationSteps(migrationPlan.steps),
        risks: this.formatMigrationRisks(migrationPlan.risks),
        resources: [migrationPlan.resourceId],
        metadata: {
          sourceProvider: migrationPlan.currentProvider,
          targetProvider: migrationPlan.targetProvider,
          migrationStrategy: migrationPlan.recommendedStrategy?.name,
          estimatedTimeframe: migrationPlan.estimatedTimeframe,
          complexityLevel: migrationPlan.complexityLevel
        }
      };
      
      // Send task to CloudCostIQ
      const response = await this.client.post('/tasks', task);
      
      return response.data;
    } catch (error) {
      console.error('Error creating migration task in CloudCostIQ:', error);
      throw new Error(`CloudCostIQ integration error: ${error.message}`);
    }
  }

  /**
   * Estimate effort required for migration
   * @param {Object} migrationPlan - Migration plan
   * @returns {string} - Estimated effort (person-days)
   */
  estimateEffort(migrationPlan) {
    const complexityMap = {
      'Low': '1-3 person-days',
      'Medium': '5-10 person-days',
      'High': '15-30 person-days'
    };
    
    return complexityMap[migrationPlan.complexityLevel] || '5-10 person-days';
  }

  /**
   * Format migration steps for CloudCostIQ
   * @param {Array} steps - Migration steps
   * @returns {Array} - Formatted steps
   */
  formatMigrationSteps(steps) {
    const formattedSteps = [];
    
    if (steps && Array.isArray(steps)) {
      let stepCounter = 1;
      
      for (const phase of steps) {
        // Add phase header
        formattedSteps.push({
          id: `phase-${phase.phase.toLowerCase().replace(/\s+/g, '-')}`,
          title: phase.phase,
          type: 'phase',
          order: stepCounter * 100
        });
        
        // Add steps for this phase
        if (phase.steps && Array.isArray(phase.steps)) {
          for (let i = 0; i < phase.steps.length; i++) {
            const step = phase.steps[i];
            
            formattedSteps.push({
              id: `step-${stepCounter}-${i}`,
              title: step.name,
              description: step.description,
              type: 'step',
              order: stepCounter * 100 + (i + 1),
              status: 'pending'
            });
          }
        }
        
        stepCounter++;
      }
    }
    
    return formattedSteps;
  }

  /**
   * Format migration risks for CloudCostIQ
   * @param {Array} risks - Migration risks
   * @returns {Array} - Formatted risks
   */
  formatMigrationRisks(risks) {
    const formattedRisks = [];
    
    if (risks && Array.isArray(risks)) {
      for (const risk of risks) {
        formattedRisks.push({
          title: risk.type,
          description: risk.description,
          severity: risk.severity,
          status: 'open'
        });
      }
    }
    
    return formattedRisks;
  }

  /**
   * Export optimization opportunities to CloudCostIQ
   * @param {Array} opportunities - Optimization opportunities
   * @returns {Promise<Object>} - Response from CloudCostIQ
   */
  async exportOptimizationOpportunities(opportunities) {
    try {
      // Format opportunities for CloudCostIQ
      const formattedOpportunities = opportunities.map(opp => ({
        resourceId: opp.resourceId,
        resourceType: opp.resourceType,
        provider: opp.provider,
        optimizationType: opp.optimizationType,
        description: opp.description,
        estimatedSavings: opp.potentialSavings,
        priority: opp.priority,
        source: 'Multi-Cloud Strategy Assistant'
      }));
      
      // Send to CloudCostIQ
      const response = await this.client.post('/opportunities', {
        opportunities: formattedOpportunities
      });
      
      return response.data;
    } catch (error) {
      console.error('Error exporting optimization opportunities to CloudCostIQ:', error);
      throw new Error(`CloudCostIQ integration error: ${error.message}`);
    }
  }

  /**
   * Export monitoring alerts to CloudCostIQ
   * @param {Array} alerts - Monitoring alerts
   * @returns {Promise<Object>} - Response from CloudCostIQ
   */
  async exportAlerts(alerts) {
    try {
      // Format alerts for CloudCostIQ
      const formattedAlerts = alerts.map(alert => ({
        title: this.generateAlertTitle(alert),
        description: this.generateAlertDescription(alert),
        severity: alert.severity,
        category: alert.metricType || 'cost',
        provider: alert.provider,
        resourceId: alert.resourceId || null,
        service: alert.service || null,
        timestamp: alert.timestamp || new Date().toISOString(),
        metadata: {
          baseline: alert.baseline,
          current: alert.current,
          percentageIncrease: alert.percentageIncrease
        },
        source: 'Multi-Cloud Strategy Assistant'
      }));
      
      // Send to CloudCostIQ
      const response = await this.client.post('/alerts', {
        alerts: formattedAlerts
      });
      
      return response.data;
    } catch (error) {
      console.error('Error exporting alerts to CloudCostIQ:', error);
      throw new Error(`CloudCostIQ integration error: ${error.message}`);
    }
  }

  /**
   * Generate alert title
   * @param {Object} alert - Alert object
   * @returns {string} - Alert title
   */
  generateAlertTitle(alert) {
    if (alert.type === 'totalCostIncrease') {
      return `${alert.provider.toUpperCase()} cost increased by ${alert.percentageIncrease.toFixed(1)}%`;
    } else if (alert.type === 'serviceCostIncrease') {
      return `${alert.provider.toUpperCase()} ${alert.service} cost increased by ${alert.percentageIncrease.toFixed(1)}%`;
    } else if (alert.type === 'highCpuUtilization') {
      return `High CPU utilization on ${alert.provider.toUpperCase()} instance ${alert.instanceId}`;
    } else if (alert.type === 'highMemoryUtilization') {
      return `High memory utilization on ${alert.provider.toUpperCase()} instance ${alert.instanceId}`;
    } else {
      return `${alert.type} alert for ${alert.provider.toUpperCase()}`;
    }
  }

  /**
   * Generate alert description
   * @param {Object} alert - Alert object
   * @returns {string} - Alert description
   */
  generateAlertDescription(alert) {
    if (alert.type === 'totalCostIncrease') {
      return `Total cost for ${alert.provider.toUpperCase()} increased from $${alert.baseline.toFixed(2)} to $${alert.current.toFixed(2)}, a ${alert.percentageIncrease.toFixed(1)}% increase.`;
    } else if (alert.type === 'serviceCostIncrease') {
      return `Cost for ${alert.service} on ${alert.provider.toUpperCase()} increased from $${alert.baseline.toFixed(2)} to $${alert.current.toFixed(2)}, a ${alert.percentageIncrease.toFixed(1)}% increase.`;
    } else if (alert.type === 'highCpuUtilization') {
      return `CPU utilization on instance ${alert.instanceId} increased from ${alert.baseline.toFixed(1)}% to ${alert.current.toFixed(1)}%, a ${alert.percentageIncrease.toFixed(1)}% increase.`;
    } else if (alert.type === 'highMemoryUtilization') {
      return `Memory utilization on instance ${alert.instanceId} increased from ${alert.baseline.toFixed(1)}% to ${alert.current.toFixed(1)}%, a ${alert.percentageIncrease.toFixed(1)}% increase.`;
    } else {
      return `Alert type: ${alert.type}. Current value: ${alert.current}, baseline: ${alert.baseline}, increase: ${alert.percentageIncrease}%.`;
    }
  }

  /**
   * Get a date string for a given number of days ago
   * @param {number} daysAgo - Number of days ago
   * @returns {string} - Date string in YYYY-MM-DD format
   */
  getDateString(daysAgo) {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString().split('T')[0];
  }

  /**
   * Check connection to CloudCostIQ
   * @returns {Promise<boolean>} - Whether connection was successful
   */
  async checkConnection() {
    try {
      const response = await this.client.get('/health');
      return response.status === 200;
    } catch (error) {
      console.error('Error connecting to CloudCostIQ:', error);
      return false;
    }
  }
}

module.exports = CloudCostIQIntegration;