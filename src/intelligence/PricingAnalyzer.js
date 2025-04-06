// src/intelligence/PricingAnalyzer.js

const axios = require('axios');
const AWS = require('aws-sdk');

class PricingAnalyzer {
  constructor(config) {
    this.config = config;
    this.pricingCache = {
      aws: {},
      azure: {},
      gcp: {}
    };
    this.lastUpdated = {
      aws: null,
      azure: null,
      gcp: null
    };
    
    // Initialize AWS pricing client
    if (config.aws) {
      this.awsPricing = new AWS.Pricing({
        accessKeyId: config.aws.accessKeyId,
        secretAccessKey: config.aws.secretAccessKey,
        region: 'us-east-1' // AWS Pricing API is only available in us-east-1
      });
    }
  }

  async updatePricingData() {
    await Promise.all([
      this.updateAwsPricing(),
      this.updateAzurePricing(),
      this.updateGcpPricing()
    ]);
  }

  async updateAwsPricing() {
    // Check if cache is recent (less than 24 hours old)
    if (this.lastUpdated.aws && 
        (Date.now() - this.lastUpdated.aws) < 24 * 60 * 60 * 1000) {
      return;
    }

    try {
      // Get EC2 pricing
      const ec2PricingResponse = await this.awsPricing.getProducts({
        ServiceCode: 'AmazonEC2',
        Filters: [
          {
            Type: 'TERM_MATCH',
            Field: 'operatingSystem',
            Value: 'Linux'
          }
        ],
        MaxResults: 100 // Limit for demonstration purposes
      }).promise();
      
      // Parse and store pricing information
      this.pricingCache.aws.ec2 = this.parseAwsEc2Pricing(ec2PricingResponse);
      
      // Get EBS pricing
      const ebsPricingResponse = await this.awsPricing.getProducts({
        ServiceCode: 'AmazonEC2',
        Filters: [
          {
            Type: 'TERM_MATCH',
            Field: 'productFamily',
            Value: 'Storage'
          },
          {
            Type: 'TERM_MATCH',
            Field: 'volumeType',
            Value: 'General Purpose'
          }
        ],
        MaxResults: 20
      }).promise();
      
      this.pricingCache.aws.ebs = this.parseAwsEbsPricing(ebsPricingResponse);
      
      // Update timestamp
      this.lastUpdated.aws = Date.now();
    } catch (error) {
      console.error('Error updating AWS pricing:', error);
      throw error;
    }
  }

  parseAwsEc2Pricing(pricingData) {
    const pricing = {};
    
    if (!pricingData.PriceList) {
      return pricing;
    }
    
    pricingData.PriceList.forEach(priceListJson => {
      try {
        const priceList = JSON.parse(priceListJson);
        const product = priceList.product;
        const attributes = product.attributes;
        
        // Only process if it's an EC2 instance
        if (attributes.instanceType) {
          const instanceType = attributes.instanceType;
          const region = attributes.regionCode;
          
          if (!pricing[region]) {
            pricing[region] = {};
          }
          
          if (!pricing[region][instanceType]) {
            pricing[region][instanceType] = {
              onDemand: null,
              reserved: {
                oneYear: {
                  noUpfront: null,
                  partialUpfront: null,
                  allUpfront: null
                },
                threeYear: {
                  noUpfront: null,
                  partialUpfront: null,
                  allUpfront: null
                }
              },
              spot: null
            };
          }
          
          // Extract pricing terms
          if (priceList.terms) {
            // On-demand pricing
            if (priceList.terms.OnDemand) {
              const onDemandId = Object.keys(priceList.terms.OnDemand)[0];
              if (onDemandId) {
                const priceDimensions = priceList.terms.OnDemand[onDemandId].priceDimensions;
                const priceDimensionId = Object.keys(priceDimensions)[0];
                if (priceDimensionId) {
                  pricing[region][instanceType].onDemand = {
                    price: parseFloat(priceDimensions[priceDimensionId].pricePerUnit.USD),
                    unit: priceDimensions[priceDimensionId].unit
                  };
                }
              }
            }
            
            // Reserved instance pricing (simplified for demonstration)
            if (priceList.terms.Reserved) {
              const reservedIds = Object.keys(priceList.terms.Reserved);
              reservedIds.forEach(reservedId => {
                const reservedTerm = priceList.terms.Reserved[reservedId];
                const termAttributes = reservedTerm.termAttributes;
                
                if (termAttributes.LeaseContractLength === '1yr') {
                  // One year reserved instances
                  if (termAttributes.PurchaseOption === 'No Upfront') {
                    pricing[region][instanceType].reserved.oneYear.noUpfront = this.extractReservedPrice(reservedTerm);
                  } else if (termAttributes.PurchaseOption === 'Partial Upfront') {
                    pricing[region][instanceType].reserved.oneYear.partialUpfront = this.extractReservedPrice(reservedTerm);
                  } else if (termAttributes.PurchaseOption === 'All Upfront') {
                    pricing[region][instanceType].reserved.oneYear.allUpfront = this.extractReservedPrice(reservedTerm);
                  }
                } else if (termAttributes.LeaseContractLength === '3yr') {
                  // Three year reserved instances
                  if (termAttributes.PurchaseOption === 'No Upfront') {
                    pricing[region][instanceType].reserved.threeYear.noUpfront = this.extractReservedPrice(reservedTerm);
                  } else if (termAttributes.PurchaseOption === 'Partial Upfront') {
                    pricing[region][instanceType].reserved.threeYear.partialUpfront = this.extractReservedPrice(reservedTerm);
                  } else if (termAttributes.PurchaseOption === 'All Upfront') {
                    pricing[region][instanceType].reserved.threeYear.allUpfront = this.extractReservedPrice(reservedTerm);
                  }
                }
              });
            }
          }
        }
      } catch (error) {
        console.error('Error parsing price list:', error);
      }
    });
    
    return pricing;
  }

  extractReservedPrice(reservedTerm) {
    const priceDimensions = reservedTerm.priceDimensions;
    const priceDimensionIds = Object.keys(priceDimensions);
    
    // Find upfront fee and hourly fee
    let upfrontFee = 0;
    let hourlyFee = 0;
    
    priceDimensionIds.forEach(id => {
      const dimension = priceDimensions[id];
      if (dimension.unit === 'Quantity') {
        upfrontFee = parseFloat(dimension.pricePerUnit.USD);
      } else if (dimension.unit === 'Hrs') {
        hourlyFee = parseFloat(dimension.pricePerUnit.USD);
      }
    });
    
    return {
      upfrontFee,
      hourlyFee
    };
  }

  parseAwsEbsPricing(pricingData) {
    // Implement EBS pricing parsing (similar to EC2 parsing)
    return {};
  }

  async updateAzurePricing() {
    // Check if cache is recent
    if (this.lastUpdated.azure && 
        (Date.now() - this.lastUpdated.azure) < 24 * 60 * 60 * 1000) {
      return;
    }

    try {
      // Azure pricing API requires authentication and can be complex
      // For demonstration, we'll use a simplified approach with the retail API
      const azurePricingUrl = 'https://prices.azure.com/api/retail/prices';
      const response = await axios.get(azurePricingUrl, {
        params: {
          $filter: "serviceFamily eq 'Compute' and priceType eq 'Consumption'",
          $top: 100 // Limit for demonstration
        }
      });
      
      if (response.data && response.data.Items) {
        this.pricingCache.azure.compute = this.parseAzureComputePricing(response.data.Items);
      }
      
      // Update timestamp
      this.lastUpdated.azure = Date.now();
    } catch (error) {
      console.error('Error updating Azure pricing:', error);
      throw error;
    }
  }

  parseAzureComputePricing(pricingItems) {
    const pricing = {};
    
    pricingItems.forEach(item => {
      try {
        if (item.type === 'Consumption' && item.serviceFamily === 'Compute') {
          const region = item.location;
          const skuName = item.armSkuName || item.skuName;
          
          if (!pricing[region]) {
            pricing[region] = {};
          }
          
          if (!pricing[region][skuName]) {
            pricing[region][skuName] = {
              payAsYouGo: null,
              reserved: {
                oneYear: null,
                threeYear: null
              }
            };
          }
          
          // Set pricing based on term
          if (item.reservationTerm === '') {
            // Pay-as-you-go
            pricing[region][skuName].payAsYouGo = {
              price: item.retailPrice,
              unit: item.unitOfMeasure
            };
          } else if (item.reservationTerm === '1 Year') {
            pricing[region][skuName].reserved.oneYear = {
              price: item.retailPrice,
              unit: item.unitOfMeasure
            };
          } else if (item.reservationTerm === '3 Years') {
            pricing[region][skuName].reserved.threeYear = {
              price: item.retailPrice,
              unit: item.unitOfMeasure
            };
          }
        }
      } catch (error) {
        console.error('Error parsing Azure price item:', error);
      }
    });
    
    return pricing;
  }

  async updateGcpPricing() {
    // Check if cache is recent
    if (this.lastUpdated.gcp && 
        (Date.now() - this.lastUpdated.gcp) < 24 * 60 * 60 * 1000) {
      return;
    }

    try {
      // For demo purposes we'll use a simplified approach
      // GCP pricing can be accessed via their Cloud Billing API
      // Here we're simulating with fixed pricing data
      this.pricingCache.gcp = this.getSampleGcpPricing();
      
      // Update timestamp
      this.lastUpdated.gcp = Date.now();
    } catch (error) {
      console.error('Error updating GCP pricing:', error);
      throw error;
    }
  }

  getSampleGcpPricing() {
    // Simplified sample data - in production, this would connect to GCP's pricing API
    return {
      compute: {
        'us-central1': {
          'n1-standard-1': {
            onDemand: { price: 0.0475, unit: 'hour' },
            committed: {
              oneYear: { price: 0.0308, unit: 'hour' },
              threeYear: { price: 0.0210, unit: 'hour' }
            }
          },
          'n1-standard-2': {
            onDemand: { price: 0.0950, unit: 'hour' },
            committed: {
              oneYear: { price: 0.0617, unit: 'hour' },
              threeYear: { price: 0.0420, unit: 'hour' }
            }
          }
        },
        'europe-west1': {
          'n1-standard-1': {
            onDemand: { price: 0.0523, unit: 'hour' },
            committed: {
              oneYear: { price: 0.0339, unit: 'hour' },
              threeYear: { price: 0.0231, unit: 'hour' }
            }
          },
          'n1-standard-2': {
            onDemand: { price: 0.1045, unit: 'hour' },
            committed: {
              oneYear: { price: 0.0679, unit: 'hour' },
              threeYear: { price: 0.0462, unit: 'hour' }
            }
          }
        }
      }
    };
  }

  async getEquivalentInstanceTypes(instanceType, provider) {
    // Define instance type mapping between cloud providers
    const mappings = {
      aws: {
        't2.micro': {
          azure: 'Standard_B1s',
          gcp: 'e2-micro'
        },
        't2.small': {
          azure: 'Standard_B1ms',
          gcp: 'e2-small'
        },
        't2.medium': {
          azure: 'Standard_B2s',
          gcp: 'e2-medium'
        },
        'm5.large': {
          azure: 'Standard_D2s_v3',
          gcp: 'n2-standard-2'
        },
        'm5.xlarge': {
          azure: 'Standard_D4s_v3',
          gcp: 'n2-standard-4'
        },
        'c5.large': {
          azure: 'Standard_F2s_v2',
          gcp: 'c2-standard-4'
        },
        'r5.large': {
          azure: 'Standard_E2s_v3',
          gcp: 'm2-ultramem-2'
        }
      },
      azure: {
        'Standard_B1s': {
          aws: 't2.micro',
          gcp: 'e2-micro'
        },
        'Standard_D2s_v3': {
          aws: 'm5.large',
          gcp: 'n2-standard-2'
        }
      },
      gcp: {
        'e2-micro': {
          aws: 't2.micro',
          azure: 'Standard_B1s'
        },
        'n2-standard-2': {
          aws: 'm5.large',
          azure: 'Standard_D2s_v3'
        }
      }
    };
    
    if (!mappings[provider] || !mappings[provider][instanceType]) {
      // Return default mappings if specific mapping not found
      return {
        aws: provider === 'aws' ? instanceType : 't2.medium',
        azure: provider === 'azure' ? instanceType : 'Standard_D2s_v3',
        gcp: provider === 'gcp' ? instanceType : 'n2-standard-2'
      };
    }
    
    const result = {
      aws: provider === 'aws' ? instanceType : mappings[provider][instanceType].aws,
      azure: provider === 'azure' ? instanceType : mappings[provider][instanceType].azure,
      gcp: provider === 'gcp' ? instanceType : mappings[provider][instanceType].gcp
    };
    
    return result;
  }

  async calculateCostEstimate(resource, period = 'monthly') {
    // Ensure pricing data is up to date
    await this.updatePricingData();
    
    let hours = 0;
    switch (period) {
      case 'hourly':
        hours = 1;
        break;
      case 'daily':
        hours = 24;
        break;
      case 'monthly':
        hours = 730; // Average hours in a month (365 days / 12 months * 24 hours)
        break;
      case 'yearly':
        hours = 8760; // Hours in a year
        break;
      default:
        hours = 730;
    }
    
    // Extract resource details
    const provider = resource.provider || this.detectProvider(resource);
    const instanceType = resource.instanceType || resource.sku || resource.machineType;
    const region = resource.region || resource.location || 'us-east-1';
    
    // Get cost for current provider
    const currentCost = await this.getResourceCost(provider, instanceType, region, hours);
    
    // Get equivalent instance types in other clouds
    const equivalentTypes = await this.getEquivalentInstanceTypes(instanceType, provider);
    
    // Calculate costs across all providers
    const costs = {
      current: {
        provider,
        instanceType,
        cost: currentCost
      },
      alternatives: {}
    };
    
    // Get costs for each alternative provider
    for (const altProvider of ['aws', 'azure', 'gcp']) {
      if (altProvider !== provider) {
        const altInstanceType = equivalentTypes[altProvider];
        const altCost = await this.getResourceCost(altProvider, altInstanceType, region, hours);
        
        costs.alternatives[altProvider] = {
          instanceType: altInstanceType,
          cost: altCost
        };
      }
    }
    
    return costs;
  }

  async getResourceCost(provider, instanceType, region, hours) {
    let cost = 0;
    
    switch (provider) {
      case 'aws':
        if (this.pricingCache.aws.ec2 && 
            this.pricingCache.aws.ec2[region] && 
            this.pricingCache.aws.ec2[region][instanceType]) {
          const pricing = this.pricingCache.aws.ec2[region][instanceType];
          if (pricing.onDemand) {
            cost = pricing.onDemand.price * hours;
          }
        }
        break;
      
      case 'azure':
        if (this.pricingCache.azure.compute && 
            this.pricingCache.azure.compute[region] && 
            this.pricingCache.azure.compute[region][instanceType]) {
          const pricing = this.pricingCache.azure.compute[region][instanceType];
          if (pricing.payAsYouGo) {
            cost = pricing.payAsYouGo.price * hours;
          }
        }
        break;
      
      case 'gcp':
        if (this.pricingCache.gcp.compute && 
            this.pricingCache.gcp.compute[region] && 
            this.pricingCache.gcp.compute[region][instanceType]) {
          const pricing = this.pricingCache.gcp.compute[region][instanceType];
          if (pricing.onDemand) {
            cost = pricing.onDemand.price * hours;
          }
        }
        break;
    }
    
    return Math.round(cost * 100) / 100; // Round to 2 decimal places
  }

  detectProvider(resource) {
    // Try to determine the cloud provider based on resource properties
    if (resource.InstanceId || resource.instanceId || resource.amiLaunchIndex !== undefined) {
      return 'aws';
    } else if (resource.vmId || resource.properties?.storageProfile?.osDisk) {
      return 'azure';
    } else if (resource.kind === 'compute#instance' || resource.selfLink?.includes('compute.googleapis.com')) {
      return 'gcp';
    }
    
    // Default to AWS if we can't determine
    return 'aws';
  }
}

module.exports = PricingAnalyzer;