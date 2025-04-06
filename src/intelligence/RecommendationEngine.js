// src/intelligence/RecommendationEngine.js

class RecommendationEngine {
    constructor(cloudDataCollector, workloadClassifier, pricingAnalyzer) {
      this.cloudDataCollector = cloudDataCollector;
      this.workloadClassifier = workloadClassifier;
      this.pricingAnalyzer = pricingAnalyzer;
      
      // Recommendation rules and weights
      this.weights = {
        cost: 0.4,
        performance: 0.3,
        reliability: 0.2,
        dataTransfer: 0.05,
        vendorLockIn: 0.05
      };
      
      // Provider specialization factors
      this.providerStrengths = {
        aws: {
          computeIntensive: 0.8,
          storageIntensive: 0.7,
          memoryIntensive: 0.6,
          batchProcessing: 0.8,
          realTimeService: 0.9,
          databaseWorkload: 0.8
        },
        azure: {
          computeIntensive: 0.7,
          storageIntensive: 0.8,
          memoryIntensive: 0.7,
          batchProcessing: 0.7,
          realTimeService: 0.8,
          databaseWorkload: 0.9
        },
        gcp: {
          computeIntensive: 0.9,
          storageIntensive: 0.6,
          memoryIntensive: 0.8,
          batchProcessing: 0.9,
          realTimeService: 0.7,
          databaseWorkload: 0.7
        }
      };
      
      // Region proximity map (for data transfer cost estimation)
      this.regionProximity = {
        'us-east-1': {
          'us-east-2': 0.9,
          'us-west-1': 0.6,
          'us-west-2': 0.5,
          'eu-west-1': 0.3,
          'ap-northeast-1': 0.1
        },
        'eu-west-1': {
          'us-east-1': 0.3,
          'eu-west-2': 0.9,
          'eu-central-1': 0.8,
          'ap-northeast-1': 0.2
        }
        // Add more region mappings as needed
      };
    }
  
    async generateRecommendations() {
      // 1. Collect cloud resources
      const resources = await this.cloudDataCollector.collectAllResources();
      
      // 2. Classify workloads
      const classifiedWorkloads = this.workloadClassifier.classifyAllResources(resources);
      
      // 3. Generate recommendations for each workload
      const recommendations = await this.processWorkloads(classifiedWorkloads);
      
      return {
        resources,
        classifiedWorkloads,
        recommendations
      };
    }
  
    async processWorkloads(classifiedWorkloads) {
      const recommendations = {
        resourceRecommendations: [],
        overallStrategy: {}
      };
      
      // Process each provider's resources
      for (const provider of Object.keys(classifiedWorkloads)) {
        for (const resourceType of Object.keys(classifiedWorkloads[provider])) {
          const workloads = classifiedWorkloads[provider][resourceType];
          
          // Process each workload
          for (const workload of workloads) {
            const recommendation = await this.generateWorkloadRecommendation(workload, provider);
            recommendations.resourceRecommendations.push(recommendation);
          }
        }
      }
      
      // Generate overall strategy based on individual recommendations
      recommendations.overallStrategy = this.generateOverallStrategy(recommendations.resourceRecommendations);
      
      return recommendations;
    }
  
    async generateWorkloadRecommendation(workload, currentProvider) {
      // Basic recommendation structure
      const recommendation = {
        resourceId: workload.resourceId,
        resourceType: workload.resourceType,
        currentProvider,
        currentCost: null,
        recommendedProvider: null,
        estimatedSavings: null,
        confidenceScore: null,
        reasoning: [],
        migrationComplexity: null
      };
      
      // Get cost information across providers
      const costEstimate = await this.pricingAnalyzer.calculateCostEstimate({
        provider: currentProvider,
        instanceType: workload.resourceType,
        // Additional resource details would be included here
      });
      
      recommendation.currentCost = costEstimate.current.cost;
      
      // Score each provider based on multiple factors
      const scores = await this.scoreProviders(workload, costEstimate, currentProvider);
      
      // Find the highest scoring provider
      let highestScore = 0;
      let bestProvider = currentProvider; // Default to current provider
      
      for (const [provider, score] of Object.entries(scores)) {
        if (score > highestScore) {
          highestScore = score;
          bestProvider = provider;
        }
      }
      
      // Calculate confidence based on score differential
      const currentScore = scores[currentProvider];
      const bestScore = scores[bestProvider];
      const scoreDiff = bestScore - currentScore;
      
      // Only recommend change if the score difference is significant
      if (bestProvider !== currentProvider && scoreDiff > 0.1) {
        recommendation.recommendedProvider = bestProvider;
        
        // Calculate estimated savings
        if (bestProvider in costEstimate.alternatives) {
          const newCost = costEstimate.alternatives[bestProvider].cost;
          recommendation.estimatedSavings = recommendation.currentCost - newCost;
        }
        
        // Set confidence score (normalized to 0-100%)
        recommendation.confidenceScore = Math.min(scoreDiff * 100, 100).toFixed(1) + '%';
        
        // Add reasoning
        if (scores.costFactor && scores.costFactor[bestProvider] > scores.costFactor[currentProvider]) {
          recommendation.reasoning.push(`${bestProvider.toUpperCase()} offers a lower cost for this workload type.`);
        }
        
        if (scores.performanceFactor && scores.performanceFactor[bestProvider] > scores.performanceFactor[currentProvider]) {
          recommendation.reasoning.push(`${bestProvider.toUpperCase()} provides better performance for ${workload.primaryType} workloads.`);
        }
        
        if (scores.dataTransferFactor && scores.dataTransferFactor[bestProvider] > scores.dataTransferFactor[currentProvider]) {
          recommendation.reasoning.push(`Moving to ${bestProvider.toUpperCase()} would reduce data transfer costs or latency.`);
        }
        
        // Assess migration complexity
        recommendation.migrationComplexity = this.assessMigrationComplexity(workload, currentProvider, bestProvider);
      } else {
        // No change recommended
        recommendation.recommendedProvider = currentProvider;
        recommendation.estimatedSavings = 0;
        recommendation.confidenceScore = "100%";
        recommendation.reasoning.push("Current provider is already optimal for this workload.");
      }
      
      return recommendation;
    }
  
    async scoreProviders(workload, costEstimate, currentProvider) {
      const scores = {
        aws: 0,
        azure: 0,
        gcp: 0,
        // Store factor scores for explaining the reasoning
        costFactor: {},
        performanceFactor: {},
        reliabilityFactor: {},
        dataTransferFactor: {},
        vendorLockInFactor: {}
      };
      
      // 1. Cost factor
      const costFactor = this.calculateCostFactor(costEstimate);
      scores.costFactor = costFactor;
      
      for (const provider of Object.keys(costFactor)) {
        scores[provider] += costFactor[provider] * this.weights.cost;
      }
      
      // 2. Performance factor based on workload classification and provider strengths
      const performanceFactor = this.calculatePerformanceFactor(workload);
      scores.performanceFactor = performanceFactor;
      
      for (const provider of Object.keys(performanceFactor)) {
        scores[provider] += performanceFactor[provider] * this.weights.performance;
      }
      
      // 3. Reliability factor
      const reliabilityFactor = {
        aws: 0.85,
        azure: 0.82,
        gcp: 0.83
      };
      scores.reliabilityFactor = reliabilityFactor;
      
      for (const provider of Object.keys(reliabilityFactor)) {
        scores[provider] += reliabilityFactor[provider] * this.weights.reliability;
      }
      
      // 4. Data transfer cost/latency factor
      const dataTransferFactor = this.calculateDataTransferFactor(workload, currentProvider);
      scores.dataTransferFactor = dataTransferFactor;
      
      for (const provider of Object.keys(dataTransferFactor)) {
        scores[provider] += dataTransferFactor[provider] * this.weights.dataTransfer;
      }
      
      // 5. Vendor lock-in factor
      const vendorLockInFactor = {
        aws: 0.7,  // Higher risk of lock-in
        azure: 0.75,
        gcp: 0.8   // Lower risk of lock-in
      };
      scores.vendorLockInFactor = vendorLockInFactor;
      
      for (const provider of Object.keys(vendorLockInFactor)) {
        scores[provider] += vendorLockInFactor[provider] * this.weights.vendorLockIn;
      }
      
      return scores;
    }
  
    calculateCostFactor(costEstimate) {
      const factor = {};
      const current = costEstimate.current;
      const alternatives = costEstimate.alternatives;
      
      // Set factor for current provider
      factor[current.provider] = 1.0;
      
      // Calculate factors for alternatives
      for (const [provider, alternative] of Object.entries(alternatives)) {
        // Cost ratio (current cost / alternative cost)
        // Higher ratio means the alternative is cheaper (better score)
        const ratio = current.cost / alternative.cost;
        
        // Apply a normalized score between 0 and 1
        // If ratio is 1, costs are the same
        // If ratio > 1, alternative is cheaper
        // If ratio < 1, alternative is more expensive
        if (ratio >= 1) {
          // Alternative is cheaper or the same
          factor[provider] = Math.min(ratio, 2.0) / 2.0; // Cap at 1.0
        } else {
          // Alternative is more expensive
          factor[provider] = ratio;
        }
      }
      
      return factor;
    }
  
    calculatePerformanceFactor(workload) {
      const factor = {
        aws: 0,
        azure: 0,
        gcp: 0
      };
      
      // Get the primary workload type
      const primaryType = workload.primaryType;
      
      // Use the provider strengths to score each provider
      for (const provider of Object.keys(factor)) {
        if (this.providerStrengths[provider] && 
            this.providerStrengths[provider][primaryType]) {
          factor[provider] = this.providerStrengths[provider][primaryType];
        } else {
          // Default to average score if no specific strength is defined
          factor[provider] = 0.6;
        }
      }
      
      return factor;
    }
  
    calculateDataTransferFactor(workload, currentProvider) {
      // Default factors - assumes all providers have similar data transfer costs
      const factor = {
        aws: 0.7,
        azure: 0.7,
        gcp: 0.7
      };
      
      // Give current provider a slight advantage since data is already there
      factor[currentProvider] = 0.8;
      
      // Further analysis would consider:
      // - Where other related workloads are deployed
      // - Distance between regions
      // - Data egress pricing between providers
      // - Data usage patterns
      
      return factor;
    }
  
    assessMigrationComplexity(workload, currentProvider, targetProvider) {
      // Default complexity levels
      const complexity = {
        level: 'Medium',
        score: 0.5,
        factors: []
      };
      
      // Adjust based on workload type
      if (workload.classifications.includes('databaseWorkload')) {
        complexity.level = 'High';
        complexity.score = 0.8;
        complexity.factors.push('Database migrations require careful data transfer and schema compatibility validation');
      } else if (workload.classifications.includes('stateless') || 
                 workload.classifications.includes('batchProcessing')) {
        complexity.level = 'Low';
        complexity.score = 0.3;
        complexity.factors.push('Stateless workloads are typically easier to migrate');
      }
      
      // Adjust based on compliance requirements
      if (workload.compliance && workload.compliance.length > 0) {
        complexity.level = 'High';
        complexity.score = Math.max(complexity.score, 0.9);
        complexity.factors.push('Compliance requirements add migration complexity');
      }
      
      // Adjust based on provider compatibility
      if (currentProvider === 'aws' && targetProvider === 'azure') {
        // AWS to Azure has good migration tooling
        complexity.score -= 0.1;
        complexity.factors.push('AWS to Azure migration tooling available');
      }
      
      // Final complexity level determination
      if (complexity.score < 0.4) {
        complexity.level = 'Low';
      } else if (complexity.score < 0.7) {
        complexity.level = 'Medium';
      } else {
        complexity.level = 'High';
      }
      
      return complexity;
    }
  
    generateOverallStrategy(resourceRecommendations) {
      const strategy = {
        summary: {
          totalResources: resourceRecommendations.length,
          recommendedMoves: 0,
          estimatedTotalSavings: 0,
          distributionRecommendation: {
            aws: 0,
            azure: 0,
            gcp: 0
          }
        },
        phases: [],
        riskAssessment: {}
      };
      
      // Count recommendations and calculate total savings
      for (const rec of resourceRecommendations) {
        if (rec.recommendedProvider !== rec.currentProvider) {
          strategy.summary.recommendedMoves++;
          strategy.summary.estimatedTotalSavings += rec.estimatedSavings || 0;
        }
        
        // Count recommended distribution
        strategy.summary.distributionRecommendation[rec.recommendedProvider]++;
      }
      
      // Convert counts to percentages
      for (const provider of Object.keys(strategy.summary.distributionRecommendation)) {
        strategy.summary.distributionRecommendation[provider] = 
          Math.round((strategy.summary.distributionRecommendation[provider] / 
                     strategy.summary.totalResources) * 100) + '%';
      }
      
      // Create migration phases
      // Phase 1: Low complexity migrations
      const phase1 = {
        name: 'Phase 1 - Quick Wins',
        description: 'Low complexity migrations with high saving potential',
        resources: resourceRecommendations.filter(r => 
          r.recommendedProvider !== r.currentProvider && 
          r.migrationComplexity.level === 'Low' &&
          r.estimatedSavings > 0
        ).map(r => ({
          resourceId: r.resourceId,
          currentProvider: r.currentProvider,
          targetProvider: r.recommendedProvider,
          estimatedSavings: r.estimatedSavings
        }))
      };
      
      // Phase 2: Medium complexity migrations
      const phase2 = {
        name: 'Phase 2 - Strategic Migrations',
        description: 'Medium complexity migrations with good ROI',
        resources: resourceRecommendations.filter(r => 
          r.recommendedProvider !== r.currentProvider && 
          r.migrationComplexity.level === 'Medium' &&
          r.estimatedSavings > 0
        ).map(r => ({
          resourceId: r.resourceId,
          currentProvider: r.currentProvider,
          targetProvider: r.recommendedProvider,
          estimatedSavings: r.estimatedSavings
        }))
      };
      
      // Phase 3: High complexity migrations
      const phase3 = {
        name: 'Phase 3 - Complex Transformations',
        description: 'High complexity migrations requiring significant planning',
        resources: resourceRecommendations.filter(r => 
          r.recommendedProvider !== r.currentProvider && 
          r.migrationComplexity.level === 'High'
        ).map(r => ({
          resourceId: r.resourceId,
          currentProvider: r.currentProvider,
          targetProvider: r.recommendedProvider,
          estimatedSavings: r.estimatedSavings
        }))
      };
      
      strategy.phases = [phase1, phase2, phase3].filter(p => p.resources.length > 0);
      
      // Risk assessment
      strategy.riskAssessment = {
        vendorLockInRisk: this.assessVendorLockInRisk(strategy.summary.distributionRecommendation),
        migrationRisk: this.assessMigrationRisk(strategy.phases),
        costVariabilityRisk: 'Medium',
        recommendedMitigations: [
          'Implement a cloud-agnostic containerization strategy using Kubernetes',
          'Develop infrastructure-as-code templates for multiple providers',
          'Use abstraction layers for cloud-specific services',
          'Maintain up-to-date documentation of all inter-service dependencies'
        ]
      };
      
      return strategy;
    }
  
    assessVendorLockInRisk(distribution) {
      // Check if any single provider has more than 60% of resources
      for (const [provider, percentage] of Object.entries(distribution)) {
        const numPercent = parseInt(percentage.replace('%', ''));
        if (numPercent > 60) {
          return {
            level: 'High',
            description: `High concentration (${numPercent}%) of resources in ${provider.toUpperCase()}`
          };
        } else if (numPercent > 40) {
          return {
            level: 'Medium',
            description: `Moderate concentration (${numPercent}%) of resources in ${provider.toUpperCase()}`
          };
        }
      }
      
      return {
        level: 'Low',
        description: 'Well-distributed resources across multiple providers'
      };
    }
  
    assessMigrationRisk(phases) {
      // Count high complexity migrations
      const highComplexityCount = phases.filter(p => p.name.includes('Complex')).reduce(
        (count, phase) => count + phase.resources.length, 0
      );
      
      if (highComplexityCount > 10) {
        return {
          level: 'High',
          description: `Large number (${highComplexityCount}) of complex migrations required`
        };
      } else if (highComplexityCount > 3) {
        return {
          level: 'Medium',
          description: `Moderate number (${highComplexityCount}) of complex migrations required`
        };
      } else {
        return {
          level: 'Low',
          description: 'Few or no complex migrations required'
        };
      }
    }
  }
  
  module.exports = RecommendationEngine;