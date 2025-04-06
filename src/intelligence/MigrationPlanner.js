// src/implementation/MigrationPlanner.js

class MigrationPlanner {
    constructor() {
      this.migrationStrategies = {
        'rehost': {
          name: 'Rehost (Lift & Shift)',
          description: 'Move an application to a new host with minimal changes',
          bestFor: ['Virtual machines', 'Simple web applications', 'Legacy applications'],
          complexity: 'Low',
          risk: 'Low',
          timeframe: 'Fast',
          costSavings: 'Minimal'
        },
        'replatform': {
          name: 'Replatform (Lift & Optimize)',
          description: 'Move to a new platform with some optimizations',
          bestFor: ['Applications needing minor optimizations', 'Database migrations'],
          complexity: 'Medium',
          risk: 'Medium',
          timeframe: 'Medium',
          costSavings: 'Moderate'
        },
        'refactor': {
          name: 'Refactor / Re-architect',
          description: 'Significantly change the application to better leverage cloud capabilities',
          bestFor: ['Applications needing major optimizations', 'Legacy applications that need modernization'],
          complexity: 'High',
          risk: 'High',
          timeframe: 'Slow',
          costSavings: 'High'
        },
        'repurchase': {
          name: 'Repurchase (Drop & Shop)',
          description: 'Replace with a different product, typically SaaS',
          bestFor: ['Commodity applications', 'CRM, Email, Collaboration tools'],
          complexity: 'Medium',
          risk: 'Medium',
          timeframe: 'Fast',
          costSavings: 'Variable'
        },
        'retire': {
          name: 'Retire',
          description: 'Decommission or remove applications that are no longer needed',
          bestFor: ['Redundant applications', 'Low-value applications'],
          complexity: 'Low',
          risk: 'Low',
          timeframe: 'Fast',
          costSavings: 'High'
        },
        'retain': {
          name: 'Retain (Revisit)',
          description: 'Keep applications as-is with no changes',
          bestFor: ['Critical applications with compliance requirements', 'Applications recently upgraded'],
          complexity: 'None',
          risk: 'None',
          timeframe: 'None',
          costSavings: 'None'
        }
      };
      
      this.migrationTools = {
        'aws-to-azure': [
          {
            name: 'Azure Migrate',
            description: 'Azure\'s service for migrating from AWS to Azure',
            url: 'https://azure.microsoft.com/services/azure-migrate/',
            bestFor: ['EC2 to Azure VM', 'RDS to Azure SQL']
          },
          {
            name: 'Azure Database Migration Service',
            description: 'Specialized service for migrating databases to Azure',
            url: 'https://azure.microsoft.com/services/database-migration/',
            bestFor: ['RDS to Azure SQL', 'DynamoDB to Cosmos DB']
          }
        ],
        'aws-to-gcp': [
          {
            name: 'Google Cloud Migration Center',
            description: 'GCP\'s central hub for migrations',
            url: 'https://cloud.google.com/migration-center',
            bestFor: ['EC2 to Compute Engine', 'S3 to Cloud Storage']
          },
          {
            name: 'Google Database Migration Service',
            description: 'Service for migrating databases to GCP',
            url: 'https://cloud.google.com/database-migration',
            bestFor: ['RDS to Cloud SQL', 'Aurora to AlloyDB']
          }
        ],
        'azure-to-aws': [
          {
            name: 'AWS Migration Hub',
            description: 'AWS\'s central hub for migrations',
            url: 'https://aws.amazon.com/migration-hub/',
            bestFor: ['Azure VM to EC2', 'Azure SQL to RDS']
          },
          {
            name: 'AWS Database Migration Service',
            description: 'Service for migrating databases to AWS',
            url: 'https://aws.amazon.com/dms/',
            bestFor: ['Azure SQL to RDS', 'Cosmos DB to DynamoDB']
          }
        ],
        'azure-to-gcp': [
          {
            name: 'Google Cloud Migration Center',
            description: 'GCP\'s central hub for migrations',
            url: 'https://cloud.google.com/migration-center',
            bestFor: ['Azure VM to Compute Engine', 'Azure Storage to Cloud Storage']
          }
        ],
        'gcp-to-aws': [
          {
            name: 'AWS Migration Hub',
            description: 'AWS\'s central hub for migrations',
            url: 'https://aws.amazon.com/migration-hub/',
            bestFor: ['Compute Engine to EC2', 'Cloud Storage to S3']
          }
        ],
        'gcp-to-azure': [
          {
            name: 'Azure Migrate',
            description: 'Azure\'s service for migrating to Azure',
            url: 'https://azure.microsoft.com/services/azure-migrate/',
            bestFor: ['Compute Engine to Azure VM', 'Cloud SQL to Azure SQL']
          }
        ]
      };
    }
  
    generateMigrationPlan(resourceRecommendation) {
      const { resourceId, resourceType, currentProvider, recommendedProvider, estimatedSavings, migrationComplexity } = resourceRecommendation;
      
      // Basic plan structure
      const plan = {
        resourceId,
        resourceType,
        currentProvider,
        targetProvider: recommendedProvider,
        estimatedSavings,
        complexityLevel: migrationComplexity?.level || 'Medium',
        recommendedStrategy: null,
        alternativeStrategies: [],
        migrationTooling: [],
        estimatedTimeframe: null,
        steps: [],
        risks: [],
        mitigations: [],
        downtime: {
          estimated: null,
          minimizationStrategies: []
        }
      };
      
      // Determine the recommended migration strategy
      plan.recommendedStrategy = this.determineStrategy(resourceRecommendation);
      
      // Add alternative strategies
      plan.alternativeStrategies = this.determineAlternativeStrategies(plan.recommendedStrategy.name);
      
      // Set migration tooling recommendations
      const migrationRoute = `${currentProvider}-to-${recommendedProvider}`;
      if (this.migrationTools[migrationRoute]) {
        plan.migrationTooling = this.migrationTools[migrationRoute].filter(tool => {
          // Add tools that are appropriate for this resource type
          return tool.bestFor.some(bestFor => 
            resourceType.toLowerCase().includes(bestFor.toLowerCase().split(' ')[0])
          );
        });
      }
      
      // Set estimated timeframe
      plan.estimatedTimeframe = this.estimateTimeframe(plan.recommendedStrategy.timeframe, migrationComplexity?.level || 'Medium');
      
      // Generate migration steps
      plan.steps = this.generateMigrationSteps(resourceRecommendation, plan.recommendedStrategy.name);
      
      // Identify risks and mitigations
      const riskAssessment = this.assessRisks(resourceRecommendation, plan.recommendedStrategy.name);
      plan.risks = riskAssessment.risks;
      plan.mitigations = riskAssessment.mitigations;
      
      // Estimate downtime
      plan.downtime = this.estimateDowntime(resourceRecommendation, plan.recommendedStrategy.name);
      
      return plan;
    }
  
    determineStrategy(recommendation) {
      let strategy = 'rehost'; // Default to lift & shift
      
      // For database workloads, prefer replatform
      if (recommendation.resourceType.toLowerCase().includes('db') || 
          (recommendation.classifications && recommendation.classifications.includes('databaseWorkload'))) {
        strategy = 'replatform';
      }
      
      // For heavily custom applications or high complexity, consider refactor
      if (recommendation.migrationComplexity?.level === 'High') {
        strategy = 'refactor';
      }
      
      // If savings are minimal and complexity is high, consider retain
      if (recommendation.estimatedSavings < 100 && recommendation.migrationComplexity?.level === 'High') {
        strategy = 'retain';
      }
      
      // If the workload is obsolete or redundant, suggest retire
      if (recommendation.classifications && recommendation.classifications.includes('obsolete')) {
        strategy = 'retire';
      }
      
      // If the service can be replaced with a SaaS equivalent, suggest repurchase
      if (recommendation.classifications && 
          (recommendation.classifications.includes('email') || 
           recommendation.classifications.includes('crm') ||
           recommendation.classifications.includes('collaboration'))) {
        strategy = 'repurchase';
      }
      
      return this.migrationStrategies[strategy];
    }
  
    determineAlternativeStrategies(primaryStrategy) {
      // Return 1-2 alternative strategies that might be applicable
      const allStrategies = Object.values(this.migrationStrategies);
      return allStrategies
        .filter(strategy => strategy.name !== primaryStrategy)
        .sort(() => 0.5 - Math.random()) // Shuffle
        .slice(0, 2); // Take first two
    }
  
    estimateTimeframe(strategyTimeframe, complexityLevel) {
      // Convert strategy timeframe to actual time estimate
      const baseEstimates = {
        'Fast': {
          'Low': '1-2 weeks',
          'Medium': '2-4 weeks',
          'High': '1-2 months'
        },
        'Medium': {
          'Low': '1-2 months',
          'Medium': '2-3 months',
          'High': '3-6 months'
        },
        'Slow': {
          'Low': '3-6 months',
          'Medium': '6-9 months',
          'High': '9-12 months'
        },
        'None': {
          'Low': 'N/A',
          'Medium': 'N/A',
          'High': 'N/A'
        }
      };
      
      return baseEstimates[strategyTimeframe][complexityLevel];
    }
  
    generateMigrationSteps(recommendation, strategyName) {
      const steps = [];
      
      // Basic planning steps for all migrations
      steps.push({
        phase: 'Planning',
        steps: [
          {
            name: 'Detailed Assessment',
            description: 'Perform a deep analysis of the application dependencies, architecture, and requirements'
          },
          {
            name: 'Create Migration Plan',
            description: 'Develop a detailed timeline, resource allocation, and technical migration plan'
          },
          {
            name: 'Establish Success Criteria',
            description: 'Define metrics and KPIs to measure migration success'
          }
        ]
      });
      
      // Add strategy-specific steps
      switch (strategyName) {
        case 'Rehost (Lift & Shift)':
          steps.push({
            phase: 'Preparation',
            steps: [
              {
                name: 'Create Target Environment',
                description: `Set up the target environment in ${recommendation.recommendedProvider}`
              },
              {
                name: 'Set Up Migration Tools',
                description: 'Configure and test the selected migration tools'
              },
              {
                name: 'Create Backup',
                description: 'Create a complete backup of the source environment'
              }
            ]
          });
          
          steps.push({
            phase: 'Migration',
            steps: [
              {
                name: 'Test Migration',
                description: 'Perform a test migration to validate the process'
              },
              {
                name: 'Schedule Downtime',
                description: 'Schedule and communicate the migration window'
              },
              {
                name: 'Perform Migration',
                description: 'Execute the migration process'
              },
              {
                name: 'Verify Data Integrity',
                description: 'Validate that all data has been migrated correctly'
              }
            ]
          });
          break;
          
        case 'Replatform (Lift & Optimize)':
          steps.push({
            phase: 'Preparation',
            steps: [
              {
                name: 'Identify Optimization Opportunities',
                description: 'Determine specific optimizations to make during migration'
              },
              {
                name: 'Create Target Environment',
                description: `Set up the optimized target environment in ${recommendation.recommendedProvider}`
              },
              {
                name: 'Refine Data Migration Strategy',
                description: 'Plan for data schema changes or transformations'
              }
            ]
          });
          
          steps.push({
            phase: 'Migration',
            steps: [
              {
                name: 'Implement Target Optimizations',
                description: 'Apply the planned optimizations in the target environment'
              },
              {
                name: 'Test Migration Process',
                description: 'Validate the migration and optimization process'
              },
              {
                name: 'Migrate Data with Transformations',
                description: 'Execute data migration with necessary transformations'
              },
              {
                name: 'Perform Application Migration',
                description: 'Migrate the application components with optimizations'
              }
            ]
          });
          break;
          
        case 'Refactor / Re-architect':
          steps.push({
            phase: 'Preparation',
            steps: [
              {
                name: 'Application Architecture Redesign',
                description: 'Redesign the application architecture to better leverage cloud capabilities'
              },
              {
                name: 'Code Refactoring Plan',
                description: 'Develop a detailed plan for code changes required'
              },
              {
                name: 'Data Model Redesign',
                description: 'Optimize data models for the target platform'
              }
            ]
          });
          
          steps.push({
            phase: 'Development',
            steps: [
              {
                name: 'Develop Refactored Components',
                description: 'Implement the architectural and code changes'
              },
              {
                name: 'Set Up CI/CD Pipeline',
                description: 'Establish continuous integration and deployment pipelines'
              },
              {
                name: 'Develop Data Migration Scripts',
                description: 'Create scripts for data transformation and migration'
              }
            ]
          });
          
          steps.push({
            phase: 'Migration',
            steps: [
              {
                name: 'Deploy Refactored Application',
                description: 'Deploy the redesigned application to the target environment'
              },
              {
                name: 'Migrate and Transform Data',
                description: 'Execute data migration with transformations'
              },
              {
                name: 'Parallel Running Period',
                description: 'Run both old and new systems in parallel during transition'
              },
              {
                name: 'Cutover to New System',
                description: 'Gradually shift traffic to the new system'
              }
            ]
          });
          break;
          
        case 'Repurchase (Drop & Shop)':
          steps.push({
            phase: 'Preparation',
            steps: [
              {
                name: 'Vendor Selection',
                description: 'Evaluate and select the replacement SaaS solution'
              },
              {
                name: 'Feature Mapping',
                description: 'Map current functionality to new solution capabilities'
              },
              {
                name: 'Data Export Planning',
                description: 'Plan how to extract data from the current system'
              }
            ]
          });
          
          steps.push({
            phase: 'Migration',
            steps: [
              {
                name: 'Configure New Solution',
                description: 'Set up and configure the new SaaS solution'
              },
              {
                name: 'Export and Transform Data',
                description: 'Extract and transform data for the new system'
              },
              {
                name: 'Import Data',
                description: 'Import the transformed data into the new system'
              },
              {
                name: 'User Training',
                description: 'Train users on the new system'
              },
              {
                name: 'Cutover to New System',
                description: 'Switch users to the new solution'
              }
            ]
          });
          break;
          
        case 'Retire':
          steps.push({
            phase: 'Preparation',
            steps: [
              {
                name: 'Data Archiving Plan',
                description: 'Develop a plan to archive necessary data'
              },
              {
                name: 'User Communication',
                description: 'Communicate retirement plans to users'
              },
              {
                name: 'Dependency Analysis',
                description: 'Identify and plan for handling dependent systems'
              }
            ]
          });
          
          steps.push({
            phase: 'Execution',
            steps: [
              {
                name: 'Data Archiving',
                description: 'Archive required data for retention'
              },
              {
                name: 'Update Dependent Systems',
                description: 'Modify systems that depend on the retiring application'
              },
              {
                name: 'Decommission Application',
                description: 'Shut down and remove the application'
              },
              {
                name: 'Resource Cleanup',
                description: 'Clean up and reclaim infrastructure resources'
              }
            ]
          });
          break;
          
        case 'Retain (Revisit)':
          steps.push({
            phase: 'Documentation',
            steps: [
              {
                name: 'Document Decision Rationale',
                description: 'Document reasons for retaining the current system'
              },
              {
                name: 'Set Future Review Date',
                description: 'Schedule a date to revisit the migration decision'
              }
            ]
          });
          
          steps.push({
            phase: 'Optimization',
            steps: [
              {
                name: 'Identify On-Premises Optimizations',
                description: 'Look for ways to optimize the current deployment'
              },
              {
                name: 'Implement Cost-Saving Measures',
                description: 'Apply any possible cost optimizations in the current environment'
              }
            ]
          });
          break;
      }
      
      // Add post-migration steps for all except Retain and Retire
      if (!['Retain (Revisit)', 'Retire'].includes(strategyName)) {
        steps.push({
          phase: 'Post-Migration',
          steps: [
            {
              name: 'Validation and Testing',
              description: 'Perform thorough validation of the migrated system'
            },
            {
              name: 'Performance Tuning',
              description: 'Optimize performance in the new environment'
            },
            {
              name: 'Monitoring Setup',
              description: 'Implement monitoring and alerting'
            },
            {
              name: 'Decommission Source',
              description: 'Once stable, decommission the original resources'
            }
          ]
        });
      }
      
      return steps;
    }
  
    assessRisks(recommendation, strategyName) {
      const risks = [];
      const mitigations = [];
      
      // Common risks for all migration types
      risks.push({
        type: 'Data Loss Risk',
        severity: 'High',
        description: 'Risk of data loss during migration'
      });
      
      mitigations.push({
        risk: 'Data Loss Risk',
        action: 'Create full backups before migration and validate data integrity after transfer'
      });
      
      risks.push({
        type: 'Downtime Impact',
        severity: 'Medium',
        description: 'Service disruption during migration affecting users'
      });
      
      mitigations.push({
        risk: 'Downtime Impact',
        action: 'Schedule migration during low-traffic periods and communicate maintenance windows'
      });
      
      // Strategy-specific risks
      switch (strategyName) {
        case 'Rehost (Lift & Shift)':
          risks.push({
            type: 'Performance Issues',
            severity: 'Medium',
            description: 'Different infrastructure characteristics may affect performance'
          });
          
          mitigations.push({
            risk: 'Performance Issues',
            action: 'Conduct performance testing and adjust resource allocations as needed'
          });
          break;
          
        case 'Replatform (Lift & Optimize)':
          risks.push({
            type: 'Optimization Complications',
            severity: 'Medium',
            description: 'Optimizations may introduce unexpected behaviors'
          });
          
          mitigations.push({
            risk: 'Optimization Complications',
            action: 'Test each optimization individually before full migration'
          });
          
          risks.push({
            type: 'Data Transformation Errors',
            severity: 'High',
            description: 'Errors in data schema changes or transformations'
          });
          
          mitigations.push({
            risk: 'Data Transformation Errors',
            action: 'Thoroughly test data migration scripts with sample data before full migration'
          });
          break;
          
        case 'Refactor / Re-architect':
          risks.push({
            type: 'Project Complexity',
            severity: 'High',
            description: 'Increased scope and complexity may lead to delays or budget overruns'
          });
          
          mitigations.push({
            risk: 'Project Complexity',
            action: 'Break the refactoring into smaller, manageable phases with clear milestones'
          });
          
          risks.push({
            type: 'New Architectural Flaws',
            severity: 'Medium',
            description: 'Redesigned architecture may introduce new issues'
          });
          
          mitigations.push({
            risk: 'New Architectural Flaws',
            action: 'Conduct thorough architecture reviews and testing before implementation'
          });
          break;
          
        case 'Repurchase (Drop & Shop)':
          risks.push({
            type: 'Feature Parity Gaps',
            severity: 'High',
            description: 'New solution may not have all features of the current system'
          });
          
          mitigations.push({
            risk: 'Feature Parity Gaps',
            action: 'Conduct thorough feature mapping and gap analysis during vendor selection'
          });
          
          risks.push({
            type: 'User Adoption Issues',
            severity: 'Medium',
            description: 'Users may resist change to a new system'
          });
          
          mitigations.push({
            risk: 'User Adoption Issues',
            action: 'Invest in comprehensive training and change management'
          });
          break;
          
        case 'Retire':
          risks.push({
            type: 'Unknown Dependencies',
            severity: 'High',
            description: 'Undocumented systems may depend on the application being retired'
          });
          
          mitigations.push({
            risk: 'Unknown Dependencies',
            action: 'Perform thorough dependency analysis and monitor for issues during gradual shutdown'
          });
          
          risks.push({
            type: 'Data Retention Compliance',
            severity: 'High',
            description: 'Failing to retain required data may violate regulations'
          });
          
          mitigations.push({
            risk: 'Data Retention Compliance',
            action: 'Consult legal/compliance teams to ensure proper data archiving'
          });
          break;
          
        case 'Retain (Revisit)':
          risks.push({
            type: 'Opportunity Cost',
            severity: 'Medium',
            description: 'Missing potential benefits of cloud migration'
          });
          
          mitigations.push({
            risk: 'Opportunity Cost',
            action: 'Regularly reassess the decision and monitor changes in business needs'
          });
          
          risks.push({
            type: 'Technical Debt',
            severity: 'Medium',
            description: 'Continued accumulation of technical debt in legacy system'
          });
          
          mitigations.push({
            risk: 'Technical Debt',
            action: 'Implement maintenance best practices and continue modernization where possible'
          });
          break;
      }
      
      // Add resource-specific risks
      if (recommendation.resourceType.toLowerCase().includes('database')) {
        risks.push({
          type: 'Data Compatibility Issues',
          severity: 'High',
          description: 'Database engine differences may cause compatibility problems'
        });
        
        mitigations.push({
          risk: 'Data Compatibility Issues',
          action: 'Test with a subset of data first and address schema compatibility issues'
        });
      }
      
      if (recommendation.classifications && recommendation.classifications.includes('highAvailability')) {
        risks.push({
          type: 'Availability Impact',
          severity: 'High',
          description: 'Migration may affect high-availability requirements'
        });
        
        mitigations.push({
          risk: 'Availability Impact',
          action: 'Implement a phased migration approach with fallback options'
        });
      }
      
      return { risks, mitigations };
    }
  
    estimateDowntime(recommendation, strategyName) {
      let estimatedDowntime = 'Minimal';
      const minimizationStrategies = [];
      
      // Determine downtime based on strategy and resource type
      switch (strategyName) {
        case 'Rehost (Lift & Shift)':
          if (recommendation.resourceType.toLowerCase().includes('database')) {
            estimatedDowntime = '1-4 hours';
            minimizationStrategies.push(
              'Use database replication to minimize downtime',
              'Implement a blue-green deployment strategy'
            );
          } else {
            estimatedDowntime = '30 minutes to 2 hours';
            minimizationStrategies.push(
              'Prepare everything in advance to minimize cutover time',
              'Use DNS switching for minimal user impact'
            );
          }
          break;
          
        case 'Replatform (Lift & Optimize)':
          if (recommendation.resourceType.toLowerCase().includes('database')) {
            estimatedDowntime = '2-8 hours';
            minimizationStrategies.push(
              'Use database replication with schema transformation tools',
              'Consider a phased data migration approach'
            );
          } else {
            estimatedDowntime = '1-4 hours';
            minimizationStrategies.push(
              'Implement a blue-green deployment strategy',
              'Use feature flags to gradually enable new functionality'
            );
          }
          break;
          
        case 'Refactor / Re-architect':
          estimatedDowntime = 'Variable (potentially minimal with proper implementation)';
          minimizationStrategies.push(
            'Implement a strangler pattern to gradually replace functionality',
            'Use traffic shifting to slowly transition to the new system',
            'Run systems in parallel during transition'
          );
          break;
          
        case 'Repurchase (Drop & Shop)':
          estimatedDowntime = '4-24 hours (depending on data volume)';
          minimizationStrategies.push(
            'Pre-populate the new system before cutover',
            'Consider a phased rollout by user groups or features',
            'Plan for a weekend or off-hours cutover'
          );
          break;
          
        case 'Retire':
          estimatedDowntime = 'Planned complete shutdown';
          minimizationStrategies.push(
            'Provide ample notice to users',
            'Gradually reduce functionality before full retirement'
          );
          break;
          
        case 'Retain (Revisit)':
          estimatedDowntime = 'None';
          minimizationStrategies.push(
            'No downtime as no migration occurs'
          );
          break;
      }
      
      // Adjust for high-availability requirements
      if (recommendation.classifications && recommendation.classifications.includes('highAvailability')) {
        if (estimatedDowntime !== 'None') {
          minimizationStrategies.push(
            'Implement a zero-downtime migration pattern with failover',
            'Use load balancing to shift traffic gradually with no downtime'
          );
          
          if (!strategyName.includes('Refactor') && !strategyName.includes('Repurchase')) {
            estimatedDowntime += ' (can be reduced to near-zero with additional effort)';
          }
        }
      }
      
      return {
        estimated: estimatedDowntime,
        minimizationStrategies: Array.from(new Set(minimizationStrategies)) // Remove duplicates
      };
    }
  }
  
  module.exports = MigrationPlanner;