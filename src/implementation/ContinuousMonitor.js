// src/implementation/ContinuousMonitor.js

const AWS = require('aws-sdk');
const axios = require('axios');
const cron = require('node-cron');
const { Storage } = require('@google-cloud/storage');
const { EventHubClient } = require('@azure/event-hubs');

class ContinuousMonitor {
  constructor(config, database) {
    this.config = config;
    this.database = database; // Database interface for storing metrics
    this.monitors = {};
    this.alertThresholds = {
      costIncrease: 0.15, // 15% cost increase over baseline
      performanceDegradation: 0.25, // 25% performance degradation
      availabilityDecline: 0.05, // 5% availability decline
      dataTransferIncrease: 0.25 // 25% data transfer increase
    };
    
    // Track baseline metrics
    this.baselines = {};
    
    // Track active alerts
    this.activeAlerts = [];
  }

  initialize() {
    // Initialize provider-specific monitoring clients
    this.initializeAwsMonitoring();
    this.initializeAzureMonitoring();
    this.initializeGcpMonitoring();
    
    // Schedule monitoring jobs
    this.scheduleMonitoringJobs();
    
    console.log('Continuous monitoring initialized');
  }

  initializeAwsMonitoring() {
    if (!this.config.aws) return;
    
    this.monitors.aws = {
      cloudwatch: new AWS.CloudWatch({
        accessKeyId: this.config.aws.accessKeyId,
        secretAccessKey: this.config.aws.secretAccessKey,
        region: this.config.aws.region
      }),
      costExplorer: new AWS.CostExplorer({
        accessKeyId: this.config.aws.accessKeyId,
        secretAccessKey: this.config.aws.secretAccessKey,
        region: 'us-east-1' // Cost Explorer is only available in us-east-1
      })
    };
  }

  initializeAzureMonitoring() {
    if (!this.config.azure) return;
    
    this.monitors.azure = {
      // Azure monitoring clients would be initialized here
      // This would typically use the Azure Monitor API or Azure SDK
    };
  }

  initializeGcpMonitoring() {
    if (!this.config.gcp) return;
    
    this.monitors.gcp = {
      storage: new Storage({
        projectId: this.config.gcp.projectId,
        keyFilename: this.config.gcp.keyFilename
      })
    };
  }

  scheduleMonitoringJobs() {
    // Schedule daily cost analysis
    cron.schedule('0 1 * * *', () => this.collectCostMetrics());
    
    // Schedule hourly performance metrics collection
    cron.schedule('0 * * * *', () => this.collectPerformanceMetrics());
    
    // Schedule resource utilization check every 6 hours
    cron.schedule('0 */6 * * *', () => this.collectUtilizationMetrics());
    
    // Schedule daily optimization check
    cron.schedule('0 2 * * *', () => this.analyzeOptimizationOpportunities());
    
    // Set up real-time alerting
    this.setupRealTimeAlerts();
  }

  setupRealTimeAlerts() {
    // For AWS CloudWatch
    if (this.monitors.aws && this.monitors.aws.cloudwatch) {
      // Setup CloudWatch alarm subscription
      // In a real implementation, this would set up SNS topics and subscriptions
    }
    
    // For Azure
    if (this.monitors.azure) {
      // Setup Azure Event Hub listener
      // In a real implementation, this would create event hub listeners
    }
    
    // For GCP
    if (this.monitors.gcp) {
      // Setup GCP Cloud Monitoring alerts
      // In a real implementation, this would set up Pub/Sub subscriptions
    }
  }

  async collectCostMetrics() {
    try {
      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - 30);
      
      const results = {};
      
      // Collect AWS costs
      if (this.monitors.aws && this.monitors.aws.costExplorer) {
        results.aws = await this.collectAwsCosts(
          startDate.toISOString().split('T')[0], 
          today.toISOString().split('T')[0]
        );
      }
      
      // Collect Azure costs
      if (this.monitors.azure) {
        results.azure = await this.collectAzureCosts(
          startDate.toISOString().split('T')[0], 
          today.toISOString().split('T')[0]
        );
      }
      
      // Collect GCP costs
      if (this.monitors.gcp) {
        results.gcp = await this.collectGcpCosts(
          startDate.toISOString().split('T')[0], 
          today.toISOString().split('T')[0]
        );
      }
      
      // Store cost metrics in database
      await this.storeCostMetrics(results);
      
      // Check for cost anomalies
      await this.checkCostAnomalies(results);
      
      console.log('Cost metrics collected:', results);
      return results;
    } catch (error) {
      console.error('Error collecting cost metrics:', error);
      throw error;
    }
  }

  async collectAwsCosts(startDate, endDate) {
    try {
      const params = {
        TimePeriod: {
          Start: startDate,
          End: endDate
        },
        Granularity: 'DAILY',
        Metrics: ['UnblendedCost'],
        GroupBy: [
          {
            Type: 'DIMENSION',
            Key: 'SERVICE'
          }
        ]
      };
      
      const costData = await this.monitors.aws.costExplorer.getCostAndUsage(params).promise();
      
      // Process the cost data
      return {
        totalCost: this.calculateTotalCost(costData),
        dailyCosts: this.extractDailyCosts(costData),
        serviceBreakdown: this.extractServiceBreakdown(costData)
      };
    } catch (error) {
      console.error('Error collecting AWS costs:', error);
      return {
        error: error.message
      };
    }
  }

  calculateTotalCost(costData) {
    let total = 0;
    
    if (costData && costData.ResultsByTime) {
      for (const result of costData.ResultsByTime) {
        const amount = parseFloat(result.Total.UnblendedCost.Amount);
        total += isNaN(amount) ? 0 : amount;
      }
    }
    
    return total;
  }

  extractDailyCosts(costData) {
    const dailyCosts = [];
    
    if (costData && costData.ResultsByTime) {
      for (const result of costData.ResultsByTime) {
        dailyCosts.push({
          date: result.TimePeriod.Start,
          cost: parseFloat(result.Total.UnblendedCost.Amount),
          unit: result.Total.UnblendedCost.Unit
        });
      }
    }
    
    return dailyCosts;
  }

  extractServiceBreakdown(costData) {
    const serviceBreakdown = {};
    
    if (costData && costData.ResultsByTime) {
      for (const result of costData.ResultsByTime) {
        if (result.Groups) {
          for (const group of result.Groups) {
            const service = group.Keys[0];
            const amount = parseFloat(group.Metrics.UnblendedCost.Amount);
            
            if (!serviceBreakdown[service]) {
              serviceBreakdown[service] = 0;
            }
            
            serviceBreakdown[service] += isNaN(amount) ? 0 : amount;
          }
        }
      }
    }
    
    return serviceBreakdown;
  }

  async collectAzureCosts(startDate, endDate) {
    // In a real implementation, this would connect to the Azure Cost Management API
    // For demonstration purposes, we're returning simulated data
    return {
      totalCost: 1245.67,
      dailyCosts: [],
      serviceBreakdown: {
        'Virtual Machines': 456.78,
        'Storage': 234.56,
        'Networking': 123.45,
        'Other': 430.88
      }
    };
  }

  async collectGcpCosts(startDate, endDate) {
    // In a real implementation, this would connect to the GCP Billing API
    // For demonstration purposes, we're returning simulated data
    return {
      totalCost: 987.65,
      dailyCosts: [],
      serviceBreakdown: {
        'Compute Engine': 345.67,
        'Cloud Storage': 123.45,
        'BigQuery': 234.56,
        'Other': 283.97
      }
    };
  }

  async storeCostMetrics(metrics) {
    // Store cost metrics in database
    // This is a stub for demonstration purposes
    if (this.database) {
      await this.database.storeCostMetrics(metrics);
    }
  }

  async checkCostAnomalies(currentMetrics) {
    try {
      // Get baseline metrics from the database
      const baselineMetrics = await this.database.getBaselineCostMetrics();
      
      if (!baselineMetrics) {
        // No baseline available yet, store current metrics as baseline
        await this.database.storeBaselineCostMetrics(currentMetrics);
        return [];
      }
      
      const anomalies = [];
      
      // Check for anomalies in AWS costs
      if (currentMetrics.aws && baselineMetrics.aws) {
        const awsAnomalies = this.detectCostAnomalies(
          currentMetrics.aws, 
          baselineMetrics.aws,
          'aws'
        );
        anomalies.push(...awsAnomalies);
      }
      
      // Check for anomalies in Azure costs
      if (currentMetrics.azure && baselineMetrics.azure) {
        const azureAnomalies = this.detectCostAnomalies(
          currentMetrics.azure, 
          baselineMetrics.azure,
          'azure'
        );
        anomalies.push(...azureAnomalies);
      }
      
      // Check for anomalies in GCP costs
      if (currentMetrics.gcp && baselineMetrics.gcp) {
        const gcpAnomalies = this.detectCostAnomalies(
          currentMetrics.gcp, 
          baselineMetrics.gcp,
          'gcp'
        );
        anomalies.push(...gcpAnomalies);
      }
      
      // Store and alert for detected anomalies
      if (anomalies.length > 0) {
        await this.handleAnomalies(anomalies, 'cost');
      }
      
      return anomalies;
    } catch (error) {
      console.error('Error checking cost anomalies:', error);
      return [];
    }
  }

  detectCostAnomalies(currentMetrics, baselineMetrics, provider) {
    const anomalies = [];
    
    // Check total cost increase
    if (currentMetrics.totalCost > baselineMetrics.totalCost * (1 + this.alertThresholds.costIncrease)) {
      anomalies.push({
        provider,
        type: 'totalCostIncrease',
        baseline: baselineMetrics.totalCost,
        current: currentMetrics.totalCost,
        percentageIncrease: ((currentMetrics.totalCost - baselineMetrics.totalCost) / baselineMetrics.totalCost) * 100,
        severity: 'high'
      });
    }
    
    // Check service-specific cost increases
    for (const service in currentMetrics.serviceBreakdown) {
      const currentCost = currentMetrics.serviceBreakdown[service];
      const baselineCost = baselineMetrics.serviceBreakdown[service] || 0;
      
      // Only trigger if baseline cost was significant and increase is above threshold
      if (baselineCost > 10 && currentCost > baselineCost * (1 + this.alertThresholds.costIncrease)) {
        anomalies.push({
          provider,
          type: 'serviceCostIncrease',
          service,
          baseline: baselineCost,
          current: currentCost,
          percentageIncrease: ((currentCost - baselineCost) / baselineCost) * 100,
          severity: currentCost > 100 ? 'high' : 'medium'
        });
      }
    }
    
    return anomalies;
  }

  async handleAnomalies(anomalies, metricType) {
    // Store anomalies in database
    if (this.database) {
      await this.database.storeAnomalies(anomalies, metricType);
    }
    
    // Send alerts for anomalies
    for (const anomaly of anomalies) {
      await this.sendAlert(anomaly, metricType);
    }
    
    // Add to active alerts
    this.activeAlerts.push(...anomalies.map(anomaly => ({
      ...anomaly,
      metricType,
      timestamp: new Date(),
      acknowledged: false
    })));
  }

  async sendAlert(anomaly, metricType) {
    // Implement alert sending logic here
    // This could send emails, SMS, push notifications, etc.
    console.log(`ALERT: ${metricType} anomaly detected in ${anomaly.provider}:`, anomaly);
  }

  async collectPerformanceMetrics() {
    try {
      const results = {};
      
      // Collect AWS performance metrics
      if (this.monitors.aws && this.monitors.aws.cloudwatch) {
        results.aws = await this.collectAwsPerformanceMetrics();
      }
      
      // Collect Azure performance metrics
      if (this.monitors.azure) {
        results.azure = await this.collectAzurePerformanceMetrics();
      }
      
      // Collect GCP performance metrics
      if (this.monitors.gcp) {
        results.gcp = await this.collectGcpPerformanceMetrics();
      }
      
      // Store performance metrics in database
      await this.storePerformanceMetrics(results);
      
      // Check for performance anomalies
      await this.checkPerformanceAnomalies(results);
      
      console.log('Performance metrics collected');
      return results;
    } catch (error) {
      console.error('Error collecting performance metrics:', error);
      throw error;
    }
  }

  async collectAwsPerformanceMetrics() {
    try {
      // Collect EC2 instance performance metrics
      const instanceMetrics = await this.collectAwsEc2Metrics();
      
      // Collect RDS database performance metrics
      const databaseMetrics = await this.collectAwsRdsMetrics();
      
      // Collect S3 bucket performance metrics
      const storageMetrics = await this.collectAwsS3Metrics();
      
      // Collect Lambda function performance metrics
      const lambdaMetrics = await this.collectAwsLambdaMetrics();
      
      return {
        compute: instanceMetrics,
        database: databaseMetrics,
        storage: storageMetrics,
        lambda: lambdaMetrics
      };
    } catch (error) {
      console.error('Error collecting AWS performance metrics:', error);
      return {
        error: error.message
      };
    }
  }

  async collectAwsEc2Metrics() {
    // Get list of EC2 instances
    const ec2 = new AWS.EC2({
      accessKeyId: this.config.aws.accessKeyId,
      secretAccessKey: this.config.aws.secretAccessKey,
      region: this.config.aws.region
    });
    
    const instances = await ec2.describeInstances().promise();
    const instanceIds = [];
    
    // Extract instance IDs
    for (const reservation of instances.Reservations) {
      for (const instance of reservation.Instances) {
        if (instance.State.Name === 'running') {
          instanceIds.push(instance.InstanceId);
        }
      }
    }
    
    // Get metrics for each instance
    const metrics = [];
    for (const instanceId of instanceIds) {
      // CPU utilization
      const cpuMetrics = await this.monitors.aws.cloudwatch.getMetricStatistics({
        Namespace: 'AWS/EC2',
        MetricName: 'CPUUtilization',
        Dimensions: [{ Name: 'InstanceId', Value: instanceId }],
        StartTime: new Date(Date.now() - 3600000), // Last hour
        EndTime: new Date(),
        Period: 300, // 5-minute intervals
        Statistics: ['Average', 'Maximum']
      }).promise();
      
      // Memory utilization (requires CloudWatch agent)
      const memoryMetrics = await this.monitors.aws.cloudwatch.getMetricStatistics({
        Namespace: 'CWAgent',
        MetricName: 'mem_used_percent',
        Dimensions: [{ Name: 'InstanceId', Value: instanceId }],
        StartTime: new Date(Date.now() - 3600000), // Last hour
        EndTime: new Date(),
        Period: 300, // 5-minute intervals
        Statistics: ['Average', 'Maximum']
      }).promise().catch(() => ({ Datapoints: [] })); // May not exist if agent not installed
      
      // Network throughput
      const networkInMetrics = await this.monitors.aws.cloudwatch.getMetricStatistics({
        Namespace: 'AWS/EC2',
        MetricName: 'NetworkIn',
        Dimensions: [{ Name: 'InstanceId', Value: instanceId }],
        StartTime: new Date(Date.now() - 3600000), // Last hour
        EndTime: new Date(),
        Period: 300, // 5-minute intervals
        Statistics: ['Average', 'Sum']
      }).promise();
      
      const networkOutMetrics = await this.monitors.aws.cloudwatch.getMetricStatistics({
        Namespace: 'AWS/EC2',
        MetricName: 'NetworkOut',
        Dimensions: [{ Name: 'InstanceId', Value: instanceId }],
        StartTime: new Date(Date.now() - 3600000), // Last hour
        EndTime: new Date(),
        Period: 300, // 5-minute intervals
        Statistics: ['Average', 'Sum']
      }).promise();
      
      metrics.push({
        instanceId,
        cpu: this.processMetricDatapoints(cpuMetrics.Datapoints),
        memory: this.processMetricDatapoints(memoryMetrics.Datapoints),
        networkIn: this.processMetricDatapoints(networkInMetrics.Datapoints),
        networkOut: this.processMetricDatapoints(networkOutMetrics.Datapoints)
      });
    }
    
    return metrics;
  }

  processMetricDatapoints(datapoints) {
    if (!datapoints || datapoints.length === 0) {
      return {
        average: null,
        maximum: null,
        sum: null
      };
    }
    
    const average = datapoints.reduce((sum, point) => sum + (point.Average || 0), 0) / datapoints.length;
    const maximum = Math.max(...datapoints.map(point => point.Maximum || 0));
    const sum = datapoints.reduce((total, point) => total + (point.Sum || 0), 0);
    
    return {
      average,
      maximum,
      sum,
      datapoints: datapoints.map(point => ({
        timestamp: point.Timestamp,
        average: point.Average,
        maximum: point.Maximum,
        sum: point.Sum
      }))
    };
  }

  async collectAwsRdsMetrics() {
    // Simulated data for demonstration
    return [];
  }

  async collectAwsS3Metrics() {
    // Simulated data for demonstration
    return [];
  }

  async collectAwsLambdaMetrics() {
    // Simulated data for demonstration
    return [];
  }

  async collectAzurePerformanceMetrics() {
    // Simulated data for demonstration
    return {
      compute: [],
      database: [],
      storage: []
    };
  }

  async collectGcpPerformanceMetrics() {
    // Simulated data for demonstration
    return {
      compute: [],
      database: [],
      storage: []
    };
  }

  async storePerformanceMetrics(metrics) {
    // Store performance metrics in database
    if (this.database) {
      await this.database.storePerformanceMetrics(metrics);
    }
  }

  async checkPerformanceAnomalies(currentMetrics) {
    try {
      // Get baseline metrics from the database
      const baselineMetrics = await this.database.getBaselinePerformanceMetrics();
      
      if (!baselineMetrics) {
        // No baseline available yet, store current metrics as baseline
        await this.database.storeBaselinePerformanceMetrics(currentMetrics);
        return [];
      }
      
      const anomalies = [];
      
      // Check for anomalies in AWS performance
      if (currentMetrics.aws && baselineMetrics.aws) {
        const awsAnomalies = this.detectPerformanceAnomalies(
          currentMetrics.aws, 
          baselineMetrics.aws,
          'aws'
        );
        anomalies.push(...awsAnomalies);
      }
      
      // Similar checks for Azure and GCP
      
      // Store and alert for detected anomalies
      if (anomalies.length > 0) {
        await this.handleAnomalies(anomalies, 'performance');
      }
      
      return anomalies;
    } catch (error) {
      console.error('Error checking performance anomalies:', error);
      return [];
    }
  }

  detectPerformanceAnomalies(currentMetrics, baselineMetrics, provider) {
    const anomalies = [];
    
    // Check compute performance anomalies
    if (currentMetrics.compute && baselineMetrics.compute) {
      for (const currentInstance of currentMetrics.compute) {
        // Find matching instance in baseline
        const baselineInstance = baselineMetrics.compute.find(
          instance => instance.instanceId === currentInstance.instanceId
        );
        
        if (baselineInstance) {
          // Check CPU utilization
          if (
            baselineInstance.cpu && 
            currentInstance.cpu && 
            currentInstance.cpu.average > baselineInstance.cpu.average * (1 + this.alertThresholds.performanceDegradation)
          ) {
            anomalies.push({
              provider,
              type: 'highCpuUtilization',
              instanceId: currentInstance.instanceId,
              baseline: baselineInstance.cpu.average,
              current: currentInstance.cpu.average,
              percentageIncrease: ((currentInstance.cpu.average - baselineInstance.cpu.average) / baselineInstance.cpu.average) * 100,
              severity: currentInstance.cpu.average > 90 ? 'high' : 'medium'
            });
          }
          
          // Check memory utilization
          if (
            baselineInstance.memory && 
            currentInstance.memory && 
            currentInstance.memory.average > baselineInstance.memory.average * (1 + this.alertThresholds.performanceDegradation)
          ) {
            anomalies.push({
              provider,
              type: 'highMemoryUtilization',
              instanceId: currentInstance.instanceId,
              baseline: baselineInstance.memory.average,
              current: currentInstance.memory.average,
              percentageIncrease: ((currentInstance.memory.average - baselineInstance.memory.average) / baselineInstance.memory.average) * 100,
              severity: currentInstance.memory.average > 90 ? 'high' : 'medium'
            });
          }
        }
      }
    }
    
    // Similar checks for database, storage, etc.
    
    return anomalies;
  }

  async collectUtilizationMetrics() {
    try {
      const results = {};
      
      // Collect AWS utilization metrics
      if (this.monitors.aws) {
        results.aws = await this.collectAwsUtilizationMetrics();
      }
      
      // Collect Azure utilization metrics
      if (this.monitors.azure) {
        results.azure = await this.collectAzureUtilizationMetrics();
      }
      
      // Collect GCP utilization metrics
      if (this.monitors.gcp) {
        results.gcp = await this.collectGcpUtilizationMetrics();
      }
      
      // Store utilization metrics in database
      await this.storeUtilizationMetrics(results);
      
      console.log('Utilization metrics collected');
      return results;
    } catch (error) {
      console.error('Error collecting utilization metrics:', error);
      throw error;
    }
  }

  async collectAwsUtilizationMetrics() {
    try {
      const ec2 = new AWS.EC2({
        accessKeyId: this.config.aws.accessKeyId,
        secretAccessKey: this.config.aws.secretAccessKey,
        region: this.config.aws.region
      });
      
      // Get EC2 instances
      const instances = await ec2.describeInstances().promise();
      const instancesData = [];
      
      // Process instance data
      for (const reservation of instances.Reservations) {
        for (const instance of reservation.Instances) {
          // Get CloudWatch metrics for utilization
          const cpuUtilization = await this.monitors.aws.cloudwatch.getMetricStatistics({
            Namespace: 'AWS/EC2',
            MetricName: 'CPUUtilization',
            Dimensions: [{ Name: 'InstanceId', Value: instance.InstanceId }],
            StartTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
            EndTime: new Date(),
            Period: 86400, // Daily average
            Statistics: ['Average']
          }).promise();
          
          // Calculate average utilization over the period
          let avgCpuUtilization = 0;
          if (cpuUtilization.Datapoints && cpuUtilization.Datapoints.length > 0) {
            avgCpuUtilization = cpuUtilization.Datapoints.reduce(
              (sum, point) => sum + point.Average, 0
            ) / cpuUtilization.Datapoints.length;
          }
          
          instancesData.push({
            instanceId: instance.InstanceId,
            instanceType: instance.InstanceType,
            state: instance.State.Name,
            availabilityZone: instance.Placement.AvailabilityZone,
            cpuUtilization: avgCpuUtilization,
            lowUtilization: avgCpuUtilization < 10, // Flag low utilization
            potentialSavings: this.calculatePotentialSavings(instance.InstanceType, avgCpuUtilization)
          });
        }
      }
      
      // Get EBS volumes
      const volumes = await ec2.describeVolumes().promise();
      const volumesData = [];
      
      // Process volume data
      for (const volume of volumes.Volumes) {
        volumesData.push({
          volumeId: volume.VolumeId,
          volumeType: volume.VolumeType,
          size: volume.Size,
          state: volume.State,
          iops: volume.Iops,
          attachments: volume.Attachments.length,
          lowUtilization: volume.Attachments.length === 0, // Flag unattached volumes
          potentialSavings: volume.Attachments.length === 0 ? this.calculateEbsSavings(volume) : 0
        });
      }
      
      return {
        instances: instancesData,
        volumes: volumesData
      };
    } catch (error) {
      console.error('Error collecting AWS utilization metrics:', error);
      return {
        error: error.message
      };
    }
  }

  calculatePotentialSavings(instanceType, cpuUtilization) {
    // A simple heuristic for potential savings
    if (cpuUtilization < 5) {
      // Instance is barely used, could be stopped or terminated
      return this.getInstanceTypeCost(instanceType) * 30; // Monthly cost
    } else if (cpuUtilization < 10) {
      // Instance is underutilized, could be downsized
      return this.getInstanceTypeCost(instanceType) * 0.5 * 30; // 50% of monthly cost
    } else if (cpuUtilization < 20) {
      // Instance is moderately utilized, might benefit from Reserved instance
      return this.getInstanceTypeCost(instanceType) * 0.3 * 30; // 30% of monthly cost
    } else {
      return 0;
    }
  }

  getInstanceTypeCost(instanceType) {
    // Simplified pricing estimates
    const pricingMap = {
      't2.micro': 0.0116,
      't2.small': 0.023,
      't2.medium': 0.0464,
      'm5.large': 0.096,
      'm5.xlarge': 0.192,
      'c5.large': 0.085,
      'c5.xlarge': 0.17
    };
    
    return pricingMap[instanceType] || 0.10; // Default fallback
  }

  calculateEbsSavings(volume) {
    // Estimated monthly cost for the volume
    let costPerGbMonth = 0;
    
    switch (volume.VolumeType) {
      case 'gp2':
        costPerGbMonth = 0.10;
        break;
      case 'io1':
        costPerGbMonth = 0.125;
        break;
      case 'st1':
        costPerGbMonth = 0.045;
        break;
      case 'sc1':
        costPerGbMonth = 0.025;
        break;
      default:
        costPerGbMonth = 0.10;
    }
    
    return volume.Size * costPerGbMonth;
  }

  async collectAzureUtilizationMetrics() {
    // Simulated data for demonstration
    return {
      virtualMachines: [],
      disks: []
    };
  }

  async collectGcpUtilizationMetrics() {
    // Simulated data for demonstration
    return {
      instances: [],
      disks: []
    };
  }

  async storeUtilizationMetrics(metrics) {
    // Store utilization metrics in database
    if (this.database) {
      await this.database.storeUtilizationMetrics(metrics);
    }
  }

  async analyzeOptimizationOpportunities() {
    try {
      // Get utilization metrics from database
      const utilizationMetrics = await this.database.getLatestUtilizationMetrics();
      
      if (!utilizationMetrics) {
        console.log('No utilization metrics available for optimization analysis');
        return [];
      }
      
      const opportunities = [];
      
      // Analyze AWS optimization opportunities
      if (utilizationMetrics.aws) {
        const awsOpportunities = this.findAwsOptimizationOpportunities(utilizationMetrics.aws);
        opportunities.push(...awsOpportunities);
      }
      
      // Analyze Azure optimization opportunities
      if (utilizationMetrics.azure) {
        const azureOpportunities = this.findAzureOptimizationOpportunities(utilizationMetrics.azure);
        opportunities.push(...azureOpportunities);
      }
      
      // Analyze GCP optimization opportunities
      if (utilizationMetrics.gcp) {
        const gcpOpportunities = this.findGcpOptimizationOpportunities(utilizationMetrics.gcp);
        opportunities.push(...gcpOpportunities);
      }
      
      // Store optimization opportunities in database
      await this.storeOptimizationOpportunities(opportunities);
      
      console.log(`Found ${opportunities.length} optimization opportunities`);
      return opportunities;
    } catch (error) {
      console.error('Error analyzing optimization opportunities:', error);
      throw error;
    }
  }

  findAwsOptimizationOpportunities(awsMetrics) {
    const opportunities = [];
    
    // Check for underutilized EC2 instances
    if (awsMetrics.instances) {
      for (const instance of awsMetrics.instances) {
        if (instance.lowUtilization) {
          opportunities.push({
            provider: 'aws',
            resourceType: 'EC2 Instance',
            resourceId: instance.instanceId,
            optimizationType: instance.cpuUtilization < 5 ? 'terminate' : 'downsize',
            description: instance.cpuUtilization < 5 
              ? `Instance has very low utilization (${instance.cpuUtilization.toFixed(2)}%). Consider terminating.`
              : `Instance has low utilization (${instance.cpuUtilization.toFixed(2)}%). Consider downsizing.`,
            potentialSavings: instance.potentialSavings,
            priority: instance.potentialSavings > 50 ? 'high' : 'medium'
          });
        }
      }
    }
    
    // Check for unattached EBS volumes
    if (awsMetrics.volumes) {
      for (const volume of awsMetrics.volumes) {
        if (volume.lowUtilization) {
          opportunities.push({
            provider: 'aws',
            resourceType: 'EBS Volume',
            resourceId: volume.volumeId,
            optimizationType: 'delete',
            description: `Volume is not attached to any instance. Consider deleting if not needed.`,
            potentialSavings: volume.potentialSavings,
            priority: volume.potentialSavings > 20 ? 'high' : 'medium'
          });
        }
      }
    }
    
    return opportunities;
  }

  findAzureOptimizationOpportunities(azureMetrics) {
    // Similar to AWS but for Azure resources
    return [];
  }

  findGcpOptimizationOpportunities(gcpMetrics) {
    // Similar to AWS but for GCP resources
    return [];
  }

  async storeOptimizationOpportunities(opportunities) {
    // Store optimization opportunities in database
    if (this.database) {
      await this.database.storeOptimizationOpportunities(opportunities);
    }
  }

  async getActiveAlerts() {
    // Filter out acknowledged alerts and sort by severity
    const activeAlerts = this.activeAlerts
      .filter(alert => !alert.acknowledged)
      .sort((a, b) => {
        const severityOrder = { high: 0, medium: 1, low: 2 };
        return severityOrder[a.severity] - severityOrder[b.severity];
      });
    
    return activeAlerts;
  }

  async acknowledgeAlert(alertId) {
    const alertIndex = this.activeAlerts.findIndex(alert => alert.id === alertId);
    
    if (alertIndex !== -1) {
      this.activeAlerts[alertIndex].acknowledged = true;
      
      // Update in database
      if (this.database) {
        await this.database.updateAlertStatus(alertId, { acknowledged: true });
      }
      
      return true;
    }
    
    return false;
  }

  async getOptimizationSummary() {
    try {
      // Get latest optimization opportunities from database
      const opportunities = await this.database.getLatestOptimizationOpportunities();
      
      // Group by provider and type
      const summary = {
        totalOpportunities: opportunities.length,
        totalPotentialSavings: opportunities.reduce((sum, opp) => sum + opp.potentialSavings, 0),
        byProvider: {},
        byType: {}
      };
      
      // Aggregate by provider
      for (const opp of opportunities) {
        if (!summary.byProvider[opp.provider]) {
          summary.byProvider[opp.provider] = {
            count: 0,
            potentialSavings: 0
          };
        }
        
        summary.byProvider[opp.provider].count++;
        summary.byProvider[opp.provider].potentialSavings += opp.potentialSavings;
        
        // Aggregate by optimization type
        if (!summary.byType[opp.optimizationType]) {
          summary.byType[opp.optimizationType] = {
            count: 0,
            potentialSavings: 0
          };
        }
        
        summary.byType[opp.optimizationType].count++;
        summary.byType[opp.optimizationType].potentialSavings += opp.potentialSavings;
      }
      
      return summary;
    } catch (error) {
      console.error('Error getting optimization summary:', error);
      return {
        totalOpportunities: 0,
        totalPotentialSavings: 0,
        byProvider: {},
        byType: {}
      };
    }
  }
}

module.exports = ContinuousMonitor;