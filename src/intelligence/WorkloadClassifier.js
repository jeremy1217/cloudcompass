class WorkloadClassifier {
    constructor() {
      this.classificationRules = this.initializeRules();
    }
  
    initializeRules() {
      return {
        computeIntensive: resource => {
          // Check if CPU utilization is consistently high
          if (resource.Metrics && resource.Metrics.CPU) {
            const avgCpuUtilization = resource.Metrics.CPU.reduce(
              (sum, datapoint) => sum + datapoint.Average,
              0
            ) / resource.Metrics.CPU.length;
            
            return avgCpuUtilization > 70; // >70% CPU utilization indicates compute-intensive
          }
          
          // If instance type contains compute optimized families
          if (resource.InstanceType && 
             (resource.InstanceType.startsWith('c5') || 
              resource.InstanceType.startsWith('c6') ||
              resource.InstanceType.includes('compute'))) {
            return true;
          }
          
          return false;
        },
        
        storageIntensive: resource => {
          // If EBS volumes are large or many
          if (resource.BlockDeviceMappings && 
              resource.BlockDeviceMappings.length > 0) {
            const totalStorage = resource.BlockDeviceMappings.reduce(
              (sum, volume) => sum + (volume.Ebs ? volume.Ebs.VolumeSize || 0 : 0),
              0
            );
            
            return totalStorage > 1000; // >1TB storage indicates storage-intensive
          }
          
          // If instance type is storage optimized
          if (resource.InstanceType && 
             (resource.InstanceType.startsWith('d2') || 
              resource.InstanceType.startsWith('i3') ||
              resource.InstanceType.includes('storage'))) {
            return true;
          }
          
          return false;
        },
        
        memoryIntensive: resource => {
          // If instance type is memory optimized
          if (resource.InstanceType && 
             (resource.InstanceType.startsWith('r5') || 
              resource.InstanceType.startsWith('r6') || 
              resource.InstanceType.startsWith('x1') ||
              resource.InstanceType.includes('memory'))) {
            return true;
          }
          
          return false;
        },
        
        batchProcessing: resource => {
          // Look for batch-related tags or names
          if (resource.Tags) {
            const hasBatchTag = resource.Tags.some(tag => 
              tag.Key.toLowerCase().includes('batch') || 
              (tag.Value && tag.Value.toLowerCase().includes('batch'))
            );
            
            if (hasBatchTag) return true;
          }
          
          if (resource.InstanceType && resource.InstanceType.includes('batch')) {
            return true;
          }
          
          // Lambda functions with high timeout values often indicate batch processing
          if (resource.Timeout && resource.Timeout > 300) { // >5 minutes
            return true;
          }
          
          return false;
        },
        
        realTimeService: resource => {
          // Look for API Gateway integrations or load balancer presence
          if (resource.Tags) {
            const hasApiTag = resource.Tags.some(tag => 
              tag.Key.toLowerCase().includes('api') || 
              (tag.Value && tag.Value.toLowerCase().includes('api'))
            );
            
            if (hasApiTag) return true;
          }
          
          // Check for connection to load balancers
          if (resource.ElasticLoadBalancerAttributes && 
              resource.ElasticLoadBalancerAttributes.length > 0) {
            return true;
          }
          
          return false;
        },
        
        databaseWorkload: resource => {
          // Check if it's a database instance
          if (resource.Engine && 
             ['mysql', 'postgres', 'oracle', 'sqlserver', 'aurora'].includes(resource.Engine.toLowerCase())) {
            return true;
          }
          
          // Check for database-related tags
          if (resource.Tags) {
            const hasDbTag = resource.Tags.some(tag => 
              tag.Key.toLowerCase().includes('db') || 
              tag.Key.toLowerCase().includes('database') || 
              (tag.Value && (tag.Value.toLowerCase().includes('db') || tag.Value.toLowerCase().includes('database')))
            );
            
            if (hasDbTag) return true;
          }
          
          return false;
        }
      };
    }
  
    classifyWorkload(resource) {
      const classification = {
        resourceId: resource.InstanceId || resource.ResourceARN || resource.id,
        resourceType: resource.InstanceType || resource.ResourceType || resource.type,
        classifications: []
      };
  
      // Apply each classification rule
      for (const [category, rule] of Object.entries(this.classificationRules)) {
        if (rule(resource)) {
          classification.classifications.push(category);
        }
      }
  
      // Determine primary workload type based on strongest signals
      if (classification.classifications.length > 0) {
        classification.primaryType = this.determinePrimaryType(classification.classifications, resource);
      } else {
        classification.primaryType = 'general';
        classification.classifications.push('general');
      }
  
      // Analyze compliance and regulatory needs based on tags
      if (resource.Tags) {
        const complianceTags = resource.Tags.filter(tag => 
          tag.Key.toLowerCase().includes('compliance') || 
          tag.Key.toLowerCase().includes('pci') || 
          tag.Key.toLowerCase().includes('hipaa') || 
          tag.Key.toLowerCase().includes('gdpr')
        );
        
        if (complianceTags.length > 0) {
          classification.compliance = complianceTags.map(tag => ({
            framework: tag.Key,
            requirement: tag.Value
          }));
        }
      }
  
      return classification;
    }
  
    determinePrimaryType(classifications, resource) {
      // Simple heuristic: return the first classification
      // This could be improved with a weighted scoring system
      return classifications[0];
    }
  
    classifyAllResources(resources) {
      const results = {};
      
      // Process AWS resources
      if (resources.aws) {
        results.aws = {};
        
        // Process EC2 instances
        if (resources.aws.ec2 && resources.aws.ec2.Reservations) {
          results.aws.ec2 = resources.aws.ec2.Reservations.flatMap(reservation => 
            reservation.Instances.map(instance => this.classifyWorkload(instance))
          );
        }
        
        // Process other AWS resource types
        // ...
      }
      
      // Process Azure resources
      if (resources.azure) {
        results.azure = {};
        
        if (resources.azure.virtualMachines) {
          results.azure.virtualMachines = resources.azure.virtualMachines.map(vm => 
            this.classifyWorkload(vm)
          );
        }
        
        // Process other Azure resource types
        // ...
      }
      
      // Process GCP resources
      if (resources.gcp) {
        results.gcp = {};
        
        if (resources.gcp.instances) {
          results.gcp.instances = resources.gcp.instances.map(instance => 
            this.classifyWorkload(instance)
          );
        }
        
        // Process other GCP resource types
        // ...
      }
      
      return results;
    }
  }
  
  module.exports = WorkloadClassifier;