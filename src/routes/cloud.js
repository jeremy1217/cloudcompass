const express = require('express');
const router = express.Router();
const { auth, admin } = require('../middleware/auth');
const AWS = require('aws-sdk');
const { AzureCliCredential } = require('@azure/identity');
const { ComputeClient } = require('@azure/arm-compute');
const { StorageClient } = require('@azure/arm-storage');
const { GoogleAuth } = require('google-auth-library');
const { compute_v1 } = require('@google-cloud/compute');

// AWS Configuration
const awsConfig = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
};

// Azure Configuration
const azureConfig = {
    subscriptionId: process.env.AZURE_SUBSCRIPTION_ID,
    tenantId: process.env.AZURE_TENANT_ID,
    clientId: process.env.AZURE_CLIENT_ID,
    clientSecret: process.env.AZURE_CLIENT_SECRET
};

// GCP Configuration
const gcpConfig = {
    projectId: process.env.GCP_PROJECT_ID,
    keyFilename: process.env.GCP_KEY_FILE
};

// Get AWS Resource Metrics
async function getAWSMetrics() {
    const cloudwatch = new AWS.CloudWatch(awsConfig);
    const ec2 = new AWS.EC2(awsConfig);
    const rds = new AWS.RDS(awsConfig);
    const s3 = new AWS.S3(awsConfig);

    try {
        // Get EC2 instances
        const ec2Instances = await ec2.describeInstances().promise();
        
        // Get RDS instances
        const rdsInstances = await rds.describeDBInstances().promise();
        
        // Get S3 buckets
        const s3Buckets = await s3.listBuckets().promise();
        
        // Get CloudWatch metrics
        const metrics = await cloudwatch.getMetricStatistics({
            Namespace: 'AWS/EC2',
            MetricName: 'CPUUtilization',
            StartTime: new Date(Date.now() - 3600000), // Last hour
            EndTime: new Date(),
            Period: 300,
            Statistics: ['Average']
        }).promise();

        return {
            ec2: ec2Instances.Reservations.map(r => r.Instances).flat(),
            rds: rdsInstances.DBInstances,
            s3: s3Buckets.Buckets,
            metrics: metrics.Datapoints
        };
    } catch (error) {
        console.error('AWS Metrics Error:', error);
        throw error;
    }
}

// Get Azure Resource Metrics
async function getAzureMetrics() {
    const credential = new AzureCliCredential();
    const computeClient = new ComputeClient(credential, azureConfig.subscriptionId);
    const storageClient = new StorageClient(credential, azureConfig.subscriptionId);

    try {
        // Get virtual machines
        const vms = [];
        for await (const vm of computeClient.virtualMachines.listAll()) {
            vms.push(vm);
        }

        // Get storage accounts
        const storageAccounts = [];
        for await (const account of storageClient.storageAccounts.list()) {
            storageAccounts.push(account);
        }

        return {
            vms,
            storageAccounts
        };
    } catch (error) {
        console.error('Azure Metrics Error:', error);
        throw error;
    }
}

// Get GCP Resource Metrics
async function getGCPMetrics() {
    const auth = new GoogleAuth({
        credentials: gcpConfig,
        scopes: ['https://www.googleapis.com/auth/cloud-platform']
    });

    const compute = new compute_v1.Compute({
        auth: auth
    });

    try {
        // Get compute instances
        const [instances] = await compute.instances.aggregatedList({
            project: gcpConfig.projectId
        });

        // Get storage buckets
        const storage = new Storage({
            projectId: gcpConfig.projectId,
            auth: auth
        });

        const [buckets] = await storage.getBuckets();

        return {
            instances: instances.items,
            buckets
        };
    } catch (error) {
        console.error('GCP Metrics Error:', error);
        throw error;
    }
}

// Enhanced workload classification
function classifyWorkloads(resources) {
    const classifications = {
        computeIntensive: [],
        storageIntensive: [],
        batchProcessing: [],
        realTimeServices: [],
        complianceNeeds: [],
        dataLocality: {
            regional: [],
            global: [],
            hybrid: []
        }
    };

    // AWS Classification
    if (resources.aws) {
        resources.aws.ec2.forEach(instance => {
            const instanceType = instance.InstanceType.toLowerCase();
            const workload = {
                provider: 'AWS',
                id: instance.InstanceId,
                type: 'EC2',
                name: instance.Tags?.find(tag => tag.Key === 'Name')?.Value || 'Unnamed',
                region: instance.Placement?.AvailabilityZone || 'Unknown',
                classification: []
            };

            // Compute vs Storage
            if (instanceType.includes('compute')) {
                workload.classification.push('Compute Intensive');
                classifications.computeIntensive.push(workload);
            } else if (instanceType.includes('storage')) {
                workload.classification.push('Storage Intensive');
                classifications.storageIntensive.push(workload);
            }

            // Batch vs Real-time
            if (instance.Tags?.some(tag => tag.Key === 'WorkloadType' && tag.Value === 'batch')) {
                workload.classification.push('Batch Processing');
                classifications.batchProcessing.push(workload);
            } else if (instance.Tags?.some(tag => tag.Key === 'WorkloadType' && tag.Value === 'realtime')) {
                workload.classification.push('Real-time Service');
                classifications.realTimeServices.push(workload);
            }

            // Data Locality
            if (instance.Tags?.some(tag => tag.Key === 'DataLocality' && tag.Value === 'regional')) {
                classifications.dataLocality.regional.push(workload);
            } else if (instance.Tags?.some(tag => tag.Key === 'DataLocality' && tag.Value === 'global')) {
                classifications.dataLocality.global.push(workload);
            } else {
                classifications.dataLocality.hybrid.push(workload);
            }

            // Compliance
            if (instance.Tags?.some(tag => tag.Key === 'Compliance' && tag.Value === 'hipaa')) {
                workload.classification.push('HIPAA Compliant');
                classifications.complianceNeeds.push(workload);
            }
            if (instance.Tags?.some(tag => tag.Key === 'Compliance' && tag.Value === 'gdpr')) {
                workload.classification.push('GDPR Compliant');
                classifications.complianceNeeds.push(workload);
            }
        });

        // RDS Classification
        resources.aws.rds.forEach(db => {
            const workload = {
                provider: 'AWS',
                id: db.DBInstanceIdentifier,
                type: 'RDS',
                name: db.DBName || 'Unnamed',
                region: db.AvailabilityZone || 'Unknown',
                classification: []
            };

            // Performance characteristics
            if (db.Engine.includes('aurora')) {
                workload.classification.push('Real-time Service');
                classifications.realTimeServices.push(workload);
            } else {
                workload.classification.push('Batch Processing');
                classifications.batchProcessing.push(workload);
            }

            // Storage characteristics
            if (db.AllocatedStorage > 1000) { // More than 1TB
                workload.classification.push('Storage Intensive');
                classifications.storageIntensive.push(workload);
            }

            // Compliance
            if (db.StorageEncrypted) {
                workload.classification.push('Encrypted Storage');
                classifications.complianceNeeds.push(workload);
            }
        });
    }

    // Azure Classification
    if (resources.azure) {
        resources.azure.vms.forEach(vm => {
            const workload = {
                provider: 'Azure',
                id: vm.id,
                type: 'VM',
                name: vm.name || 'Unnamed',
                region: vm.location || 'Unknown',
                classification: []
            };

            // Compute vs Storage
            if (vm.hardwareProfile.vmSize.toLowerCase().includes('compute')) {
                workload.classification.push('Compute Intensive');
                classifications.computeIntensive.push(workload);
            } else if (vm.hardwareProfile.vmSize.toLowerCase().includes('storage')) {
                workload.classification.push('Storage Intensive');
                classifications.storageIntensive.push(workload);
            }

            // Batch vs Real-time
            if (vm.tags?.workloadType === 'batch') {
                workload.classification.push('Batch Processing');
                classifications.batchProcessing.push(workload);
            } else if (vm.tags?.workloadType === 'realtime') {
                workload.classification.push('Real-time Service');
                classifications.realTimeServices.push(workload);
            }

            // Data Locality
            if (vm.tags?.dataLocality === 'regional') {
                classifications.dataLocality.regional.push(workload);
            } else if (vm.tags?.dataLocality === 'global') {
                classifications.dataLocality.global.push(workload);
            } else {
                classifications.dataLocality.hybrid.push(workload);
            }

            // Compliance
            if (vm.tags?.compliance === 'hipaa') {
                workload.classification.push('HIPAA Compliant');
                classifications.complianceNeeds.push(workload);
            }
            if (vm.tags?.compliance === 'gdpr') {
                workload.classification.push('GDPR Compliant');
                classifications.complianceNeeds.push(workload);
            }
        });
    }

    // GCP Classification
    if (resources.gcp) {
        resources.gcp.instances.forEach(instance => {
            const workload = {
                provider: 'GCP',
                id: instance.id,
                type: 'Compute Engine',
                name: instance.name || 'Unnamed',
                region: instance.zone || 'Unknown',
                classification: []
            };

            // Compute vs Storage
            if (instance.machineType.toLowerCase().includes('compute')) {
                workload.classification.push('Compute Intensive');
                classifications.computeIntensive.push(workload);
            } else if (instance.machineType.toLowerCase().includes('storage')) {
                workload.classification.push('Storage Intensive');
                classifications.storageIntensive.push(workload);
            }

            // Batch vs Real-time
            if (instance.labels?.workloadType === 'batch') {
                workload.classification.push('Batch Processing');
                classifications.batchProcessing.push(workload);
            } else if (instance.labels?.workloadType === 'realtime') {
                workload.classification.push('Real-time Service');
                classifications.realTimeServices.push(workload);
            }

            // Data Locality
            if (instance.labels?.dataLocality === 'regional') {
                classifications.dataLocality.regional.push(workload);
            } else if (instance.labels?.dataLocality === 'global') {
                classifications.dataLocality.global.push(workload);
            } else {
                classifications.dataLocality.hybrid.push(workload);
            }

            // Compliance
            if (instance.labels?.compliance === 'hipaa') {
                workload.classification.push('HIPAA Compliant');
                classifications.complianceNeeds.push(workload);
            }
            if (instance.labels?.compliance === 'gdpr') {
                workload.classification.push('GDPR Compliant');
                classifications.complianceNeeds.push(workload);
            }
        });
    }

    return classifications;
}

// Mock data generation
function generateMockData() {
    return {
        aws: {
            ec2: [
                {
                    InstanceId: 'i-1234567890abcdef0',
                    InstanceType: 'c5.xlarge',
                    Tags: [
                        { Key: 'Name', Value: 'Web Server' },
                        { Key: 'WorkloadType', Value: 'realtime' },
                        { Key: 'DataLocality', Value: 'regional' },
                        { Key: 'Compliance', Value: 'hipaa' }
                    ],
                    Placement: { AvailabilityZone: 'us-east-1a' }
                },
                {
                    InstanceId: 'i-0987654321fedcba0',
                    InstanceType: 'r5.2xlarge',
                    Tags: [
                        { Key: 'Name', Value: 'Data Processing' },
                        { Key: 'WorkloadType', Value: 'batch' },
                        { Key: 'DataLocality', Value: 'global' }
                    ],
                    Placement: { AvailabilityZone: 'us-west-2a' }
                }
            ],
            rds: [
                {
                    DBInstanceIdentifier: 'db-aurora-1',
                    Engine: 'aurora',
                    DBName: 'customer_db',
                    AllocatedStorage: 100,
                    StorageEncrypted: true,
                    Tags: [
                        { Key: 'Compliance', Value: 'gdpr' }
                    ],
                    AvailabilityZone: 'eu-west-1a'
                },
                {
                    DBInstanceIdentifier: 'db-mysql-1',
                    Engine: 'mysql',
                    DBName: 'analytics_db',
                    AllocatedStorage: 2000,
                    StorageEncrypted: true,
                    AvailabilityZone: 'us-east-1a'
                }
            ],
            s3: [
                { Name: 'customer-data-bucket' },
                { Name: 'backup-archive' }
            ]
        },
        azure: {
            vms: [
                {
                    id: '/subscriptions/123/resourceGroups/rg1/providers/Microsoft.Compute/virtualMachines/vm1',
                    name: 'App Server',
                    location: 'eastus',
                    hardwareProfile: { vmSize: 'Standard_D4s_v3' },
                    tags: {
                        workloadType: 'realtime',
                        dataLocality: 'regional',
                        compliance: 'hipaa'
                    }
                },
                {
                    id: '/subscriptions/123/resourceGroups/rg1/providers/Microsoft.Compute/virtualMachines/vm2',
                    name: 'Data Processing',
                    location: 'westeurope',
                    hardwareProfile: { vmSize: 'Standard_L8s_v2' },
                    tags: {
                        workloadType: 'batch',
                        dataLocality: 'global'
                    }
                }
            ],
            storageAccounts: [
                { name: 'appdata123', location: 'eastus' },
                { name: 'backup456', location: 'westeurope' }
            ]
        },
        gcp: {
            instances: [
                {
                    id: '1234567890123456789',
                    name: 'web-server-1',
                    machineType: 'e2-standard-4',
                    zone: 'us-central1-a',
                    labels: {
                        workloadType: 'realtime',
                        dataLocality: 'regional',
                        compliance: 'hipaa'
                    }
                },
                {
                    id: '9876543210987654321',
                    name: 'data-processor-1',
                    machineType: 'n2-highmem-8',
                    zone: 'europe-west1-b',
                    labels: {
                        workloadType: 'batch',
                        dataLocality: 'global'
                    }
                }
            ],
            buckets: [
                { name: 'customer-data-bucket' },
                { name: 'backup-archive' }
            ]
        }
    };
}

// Get all cloud resources
router.get('/resources', auth, admin, async (req, res) => {
    try {
        let resources;
        
        // Check if we have cloud credentials
        if (process.env.AWS_ACCESS_KEY_ID && process.env.AZURE_SUBSCRIPTION_ID && process.env.GCP_PROJECT_ID) {
            resources = {
                aws: await getAWSMetrics(),
                azure: await getAzureMetrics(),
                gcp: await getGCPMetrics()
            };
        } else {
            // Use mock data if credentials aren't available
            console.log('Using mock data for cloud resources');
            resources = generateMockData();
        }

        const classifications = classifyWorkloads(resources);

        res.json({
            resources,
            classifications
        });
    } catch (error) {
        console.error('Cloud Resources Error:', error);
        res.status(500).json({ error: 'Failed to fetch cloud resources' });
    }
});

// Get resource metrics
router.get('/metrics', auth, admin, async (req, res) => {
    try {
        let metrics;
        
        // Check if we have cloud credentials
        if (process.env.AWS_ACCESS_KEY_ID && process.env.AZURE_SUBSCRIPTION_ID && process.env.GCP_PROJECT_ID) {
            metrics = {
                aws: await getAWSMetrics(),
                azure: await getAzureMetrics(),
                gcp: await getGCPMetrics()
            };
        } else {
            // Use mock data if credentials aren't available
            console.log('Using mock data for cloud metrics');
            metrics = generateMockData();
        }

        res.json(metrics);
    } catch (error) {
        console.error('Cloud Metrics Error:', error);
        res.status(500).json({ error: 'Failed to fetch cloud metrics' });
    }
});

module.exports = router; 