// src/ui/MonitoringDashboard.js
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { PieChart, Pie, Cell } from 'recharts';

const MonitoringDashboard = ({ continuousMonitor }) => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [monitoringData, setMonitoringData] = useState(null);
  const [timeRange, setTimeRange] = useState('24h');
  const [refreshInterval, setRefreshInterval] = useState(null);
  
  // Load monitoring data
  useEffect(() => {
    loadData();
    
    // Set up refresh interval
    const interval = setInterval(() => {
      loadData();
    }, 5 * 60 * 1000); // Refresh every 5 minutes
    
    setRefreshInterval(interval);
    
    // Cleanup interval on unmount
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [timeRange]);
  
  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load data based on active tab and time range
      const data = {};
      
      // Load alerts
      data.alerts = await continuousMonitor.getActiveAlerts();
      
      // Load cost metrics
      data.costs = await getCostMetrics(timeRange);
      
      // Load performance metrics
      data.performance = await getPerformanceMetrics(timeRange);
      
      // Load utilization metrics
      data.utilization = await getUtilizationMetrics();
      
      // Load optimization opportunities
      data.optimization = await continuousMonitor.getOptimizationSummary();
      
      setMonitoringData(data);
    } catch (error) {
      console.error('Error loading monitoring data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Helper function to get cost metrics
  const getCostMetrics = async (timeRange) => {
    // In a real implementation, this would call your database or API
    // For demonstration, we'll use simulated data
    const days = parseTimeRange(timeRange);
    
    // Generate simulated cost data for the time period
    const costData = {
      trend: generateCostTrend(days),
      byProvider: {
        aws: 1425.67,
        azure: 982.34,
        gcp: 765.23
      },
      byService: {
        'EC2/Compute': 850.45,
        'RDS/Database': 625.78,
        'S3/Storage': 425.34,
        'NetworkingServices': 380.67,
        'OtherServices': 891.00
      }
    };
    
    return costData;
  };
  
  // Helper function to get performance metrics
  const getPerformanceMetrics = async (timeRange) => {
    // In a real implementation, this would call your database or API
    // For demonstration, we'll use simulated data
    const performanceData = {
      compute: [
        {
          provider: 'aws',
          resourceId: 'i-12345abcdef',
          cpu: 68.5,
          memory: 72.3,
          networkIn: 2.45,
          networkOut: 1.87
        },
        {
          provider: 'aws',
          resourceId: 'i-67890defabc',
          cpu: 45.2,
          memory: 60.7,
          networkIn: 1.23,
          networkOut: 0.95
        },
        {
          provider: 'azure',
          resourceId: 'vm-abc123',
          cpu: 78.1,
          memory: 82.4,
          networkIn: 3.67,
          networkOut: 2.85
        }
      ],
      database: [
        {
          provider: 'aws',
          resourceId: 'db-12345',
          cpu: 72.6,
          memory: 85.3,
          iops: 256.7,
          connections: 42
        }
      ],
      trend: generatePerformanceTrend(parseTimeRange(timeRange))
    };
    
    return performanceData;
  };
  
  // Helper function to get utilization metrics
  const getUtilizationMetrics = async () => {
    // In a real implementation, this would call your database or API
    // For demonstration, we'll use simulated data
    const utilizationData = {
      aws: {
        instances: [
          {
            instanceId: 'i-12345abcdef',
            instanceType: 'm5.large',
            cpuUtilization: 68.5,
            lowUtilization: false,
            potentialSavings: 0
          },
          {
            instanceId: 'i-67890defabc',
            instanceType: 't2.medium',
            cpuUtilization: 8.3,
            lowUtilization: true,
            potentialSavings: 35.67
          }
        ],
        volumes: [
          {
            volumeId: 'vol-12345abcdef',
            volumeType: 'gp2',
            size: 100,
            attachments: 1,
            lowUtilization: false,
            potentialSavings: 0
          },
          {
            volumeId: 'vol-67890defabc',
            volumeType: 'gp2',
            size: 50,
            attachments: 0,
            lowUtilization: true,
            potentialSavings: 5.23
          }
        ]
      },
      azure: {
        virtualMachines: [
          {
            id: 'vm-abc123',
            size: 'Standard_D2s_v3',
            cpuUtilization: 78.1,
            lowUtilization: false,
            potentialSavings: 0
          }
        ]
      }
    };
    
    return utilizationData;
  };
  
  // Helper function to parse time range
  const parseTimeRange = (range) => {
    if (range === '24h') return 1;
    if (range === '7d') return 7;
    if (range === '30d') return 30;
    if (range === '90d') return 90;
    return 1;
  };
  
  // Helper function to generate simulated cost trend data
  const generateCostTrend = (days) => {
    const data = [];
    const today = new Date();
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      
      // Random variations
      const awsVariation = 0.9 + Math.random() * 0.2;
      const azureVariation = 0.9 + Math.random() * 0.2;
      const gcpVariation = 0.9 + Math.random() * 0.2;
      
      // Base daily costs
      const awsCost = 48.5 * awsVariation;
      const azureCost = 32.7 * azureVariation;
      const gcpCost = 25.4 * gcpVariation;
      
      data.push({
        date: date.toISOString().split('T')[0],
        aws: parseFloat(awsCost.toFixed(2)),
        azure: parseFloat(azureCost.toFixed(2)),
        gcp: parseFloat(gcpCost.toFixed(2)),
        total: parseFloat((awsCost + azureCost + gcpCost).toFixed(2))
      });
    }
    
    return data;
  };
  
  // Helper function to generate simulated performance trend data
  const generatePerformanceTrend = (days) => {
    const data = [];
    const today = new Date();
    const hours = days * 24;
    
    for (let i = hours; i >= 0; i -= 4) { // 4-hour intervals
      const date = new Date();
      date.setHours(today.getHours() - i);
      
      // Random variations
      const cpuVariation = 0.9 + Math.random() * 0.2;
      const memoryVariation = 0.85 + Math.random() * 0.3;
      
      // Base metrics
      const cpuUsage = 65 * cpuVariation;
      const memoryUsage = 70 * memoryVariation;
      
      data.push({
        timestamp: date.toISOString(),
        cpu: parseFloat(cpuUsage.toFixed(1)),
        memory: parseFloat(memoryUsage.toFixed(1))
      });
    }
    
    return data;
  };
  
  if (loading && !monitoringData) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Cloud Monitoring</h1>
          
          <div className="flex items-center space-x-4">
            <select
              className="border rounded px-3 py-1"
              value={timeRange}
              onChange={e => setTimeRange(e.target.value)}
            >
              <option value="24h">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
            
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={loadData}
            >
              Refresh
            </button>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            className={`py-2 px-4 font-medium ${activeTab === 'overview' ? 'text-blue-600 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`py-2 px-4 font-medium ${activeTab === 'costs' ? 'text-blue-600 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('costs')}
          >
            Costs
          </button>
          <button
            className={`py-2 px-4 font-medium ${activeTab === 'performance' ? 'text-blue-600 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('performance')}
          >
            Performance
          </button>
          <button
            className={`py-2 px-4 font-medium ${activeTab === 'utilization' ? 'text-blue-600 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('utilization')}
          >
            Resource Utilization
          </button>
          <button
            className={`py-2 px-4 font-medium ${activeTab === 'alerts' ? 'text-blue-600 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('alerts')}
          >
            Alerts
          </button>
        </div>
        
        {/* Content based on active tab */}
        {activeTab === 'overview' && monitoringData && (
          <OverviewTab data={monitoringData} />
        )}
        
        {activeTab === 'costs' && monitoringData && (
          <CostsTab data={monitoringData.costs} />
        )}
        
        {activeTab === 'performance' && monitoringData && (
          <PerformanceTab data={monitoringData.performance} />
        )}
        
        {activeTab === 'utilization' && monitoringData && (
          <UtilizationTab data={monitoringData.utilization} />
        )}
        
        {activeTab === 'alerts' && monitoringData && (
          <AlertsTab 
            alerts={monitoringData.alerts} 
            onAcknowledgeAlert={(alertId) => {
              // In a real implementation, this would call your API
              console.log('Acknowledging alert:', alertId);
            }} 
          />
        )}
      </main>
    </div>
  );
};

// Overview Tab Component
const OverviewTab = ({ data }) => {
  const { alerts, costs, optimization } = data;
  
  // Prepare data for charts
  const costDistribution = Object.keys(costs.byProvider).map(provider => ({
    name: provider.toUpperCase(),
    value: costs.byProvider[provider]
  }));
  
  // Calculate alert counts
  const alertCounts = {
    total: alerts.length,
    high: alerts.filter(a => a.severity === 'high').length,
    medium: alerts.filter(a => a.severity === 'medium').length,
    low: alerts.filter(a => a.severity === 'low').length
  };
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];
  
  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Monitoring Overview</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-blue-800">Total Cloud Spend (Last 30 Days)</h3>
            <p className="text-3xl font-bold">
              ${Object.values(costs.byProvider).reduce((sum, cost) => sum + cost, 0).toFixed(2)}
            </p>
          </div>
          
          <div className={`p-4 rounded-lg ${alertCounts.high > 0 ? 'bg-red-50' : 'bg-green-50'}`}>
            <h3 className={`text-lg font-medium ${alertCounts.high > 0 ? 'text-red-800' : 'text-green-800'}`}>
              Active Alerts
            </h3>
            <p className="text-3xl font-bold">{alertCounts.total}</p>
            {alertCounts.high > 0 && (
              <p className="text-sm text-red-600 mt-1">
                {alertCounts.high} critical alert{alertCounts.high !== 1 ? 's' : ''}
              </p>
            )}
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-green-800">Optimization Potential</h3>
            <p className="text-3xl font-bold">
              ${optimization.totalPotentialSavings.toFixed(2)}/month
            </p>
            <p className="text-sm text-green-600 mt-1">
              {optimization.totalOpportunities} opportunities identified
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Cost Distribution by Provider</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={costDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={({name, value}) => `${name}: $${value.toFixed(2)}`}
                  >
                    {costDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Recent Cost Trends</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={costs.trend.slice(-7)} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${value}`} />
                  <Legend />
                  <Line type="monotone" dataKey="total" stroke="#8884d8" name="Total" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
      
      {alertCounts.total > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Active Alerts</h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Severity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Provider
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {alerts.slice(0, 5).map((alert, index) => (
                  <tr key={index} className={alert.severity === 'high' ? 'bg-red-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        alert.severity === 'high' ? 'bg-red-100 text-red-800' :
                        alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {alert.severity.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {alert.provider.toUpperCase()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {alert.type}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {alert.service ? `${alert.service}: ` : ''}
                      {alert.current ? `Current: ${alert.current.toFixed(2)}, Baseline: ${alert.baseline.toFixed(2)}, Change: ${alert.percentageIncrease.toFixed(1)}%` : ''}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(alert.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {alertCounts.total > 5 && (
            <div className="mt-3 text-right">
              <button
                className="text-blue-600 hover:text-blue-900"
                onClick={() => setActiveTab('alerts')}
              >
                View all alerts ({alertCounts.total})
              </button>
            </div>
          )}
        </div>
      )}
      
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Optimization Opportunities</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Savings by Provider</h3>
            {optimization.byProvider && (
              <div className="space-y-3">
                {Object.keys(optimization.byProvider).map(provider => (
                  <div key={provider} className="bg-gray-50 p-3 rounded">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{provider.toUpperCase()}</span>
                      <span className="text-green-600 font-medium">
                        ${optimization.byProvider[provider].potentialSavings.toFixed(2)}
                      </span>
                    </div>
                    <div className="mt-1 text-sm text-gray-500">
                      {optimization.byProvider[provider].count} opportunities
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Savings by Type</h3>
            {optimization.byType && (
              <div className="space-y-3">
                {Object.keys(optimization.byType).map(type => (
                  <div key={type} className="bg-gray-50 p-3 rounded">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">
                        {type === 'terminate' ? 'Resource Termination' :
                         type === 'downsize' ? 'Resource Downsizing' :
                         type === 'delete' ? 'Resource Deletion' : type}
                      </span>
                      <span className="text-green-600 font-medium">
                        ${optimization.byType[type].potentialSavings.toFixed(2)}
                      </span>
                    </div>
                    <div className="mt-1 text-sm text-gray-500">
                      {optimization.byType[type].count} opportunities
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Costs Tab Component
const CostsTab = ({ data }) => {
  // Prepare data for charts
  const costByService = Object.keys(data.byService).map(service => ({
    name: service,
    value: data.byService[service]
  })).sort((a, b) => b.value - a.value);
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#9482FF', '#FE2B9E'];
  
  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Cost Analysis</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {Object.keys(data.byProvider).map(provider => (
            <div key={provider} className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-blue-800">{provider.toUpperCase()}</h3>
              <p className="text-3xl font-bold">${data.byProvider[provider].toFixed(2)}</p>
            </div>
          ))}
        </div>
        
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.trend} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value}`} />
              <Legend />
              <Line type="monotone" dataKey="aws" name="AWS" stroke="#0088FE" />
              <Line type="monotone" dataKey="azure" name="Azure" stroke="#00C49F" />
              <Line type="monotone" dataKey="gcp" name="GCP" stroke="#FFBB28" />
              <Line type="monotone" dataKey="total" name="Total" stroke="#FF8042" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Cost Breakdown by Service</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Distribution</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={costByService}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={({name, value, percent}) => `${name}: $${value.toFixed(2)} (${(percent * 100).toFixed(1)}%)`}
                  >
                    {costByService.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Top Services</h3>
            <div className="space-y-3">
              {costByService.slice(0, 5).map((service, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{service.name}</span>
                    <span className="text-gray-600 font-medium">
                      ${service.value.toFixed(2)}
                    </span>
                  </div>
                  <div className="mt-1 h-2 bg-gray-200 rounded">
                    <div 
                      className="h-full rounded"
                      style={{ 
                        width: `${(service.value / costByService[0].value) * 100}%`,
                        backgroundColor: COLORS[index % COLORS.length]
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Performance Tab Component
const PerformanceTab = ({ data }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Performance Trends</h2>
        
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.trend} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={(tick) => new Date(tick).toLocaleTimeString()} 
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(label) => new Date(label).toLocaleString()}
                formatter={(value) => `${value}%`}
              />
              <Legend />
              <Line type="monotone" dataKey="cpu" name="CPU Utilization" stroke="#0088FE" />
              <Line type="monotone" dataKey="memory" name="Memory Utilization" stroke="#00C49F" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Compute Performance</h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Provider
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Resource ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CPU Utilization
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Memory Utilization
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Network (In/Out)
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.compute.map((resource, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {resource.provider.toUpperCase()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {resource.resourceId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-32 bg-gray-200 rounded h-2.5 mr-2">
                        <div 
                          className="bg-blue-600 h-2.5 rounded" 
                          style={{ width: `${resource.cpu}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-500">{resource.cpu.toFixed(1)}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-32 bg-gray-200 rounded h-2.5 mr-2">
                        <div 
                          className="bg-green-600 h-2.5 rounded" 
                          style={{ width: `${resource.memory}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-500">{resource.memory.toFixed(1)}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {resource.networkIn.toFixed(2)} / {resource.networkOut.toFixed(2)} MB/s
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {data.database && data.database.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Database Performance</h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Provider
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Resource ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CPU Utilization
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Memory Utilization
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IOPS
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Connections
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.database.map((resource, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {resource.provider.toUpperCase()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {resource.resourceId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-32 bg-gray-200 rounded h-2.5 mr-2">
                          <div 
                            className="bg-blue-600 h-2.5 rounded" 
                            style={{ width: `${resource.cpu}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-500">{resource.cpu.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-32 bg-gray-200 rounded h-2.5 mr-2">
                          <div 
                            className="bg-green-600 h-2.5 rounded" 
                            style={{ width: `${resource.memory}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-500">{resource.memory.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {resource.iops.toFixed(1)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {resource.connections}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// Utilization Tab Component
const UtilizationTab = ({ data }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Resource Utilization</h2>
        
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">AWS Resources</h3>
          
          <div className="mb-6">
            <h4 className="font-medium mb-2">EC2 Instances</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Instance ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      CPU Utilization
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Potential Savings
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.aws.instances.map((instance, index) => (
                    <tr 
                      key={index} 
                      className={
                        instance.lowUtilization ? 'bg-yellow-50' : (index % 2 === 0 ? 'bg-white' : 'bg-gray-50')
                      }
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {instance.instanceId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {instance.instanceType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-32 bg-gray-200 rounded h-2.5 mr-2">
                            <div 
                              className={`h-2.5 rounded ${
                                instance.cpuUtilization > 70 ? 'bg-red-600' :
                                instance.cpuUtilization > 30 ? 'bg-blue-600' :
                                'bg-yellow-600'
                              }`}
                              style={{ width: `${instance.cpuUtilization}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-500">{instance.cpuUtilization.toFixed(1)}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {instance.lowUtilization ? (
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Underutilized
                          </span>
                        ) : (
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Optimal
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {instance.potentialSavings > 0 ? (
                          <span className="text-green-600">${instance.potentialSavings.toFixed(2)}/month</span>
                        ) : (
                          '-'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">EBS Volumes</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Volume ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Size (GB)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Attachments
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Potential Savings
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.aws.volumes.map((volume, index) => (
                    <tr 
                      key={index} 
                      className={
                        volume.lowUtilization ? 'bg-yellow-50' : (index % 2 === 0 ? 'bg-white' : 'bg-gray-50')
                      }
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {volume.volumeId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {volume.volumeType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {volume.size}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {volume.attachments}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {volume.lowUtilization ? (
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Unattached
                          </span>
                        ) : (
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Attached
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {volume.potentialSavings > 0 ? (
                          <span className="text-green-600">${volume.potentialSavings.toFixed(2)}/month</span>
                        ) : (
                          '-'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        {data.azure && data.azure.virtualMachines && data.azure.virtualMachines.length > 0 && (
          <div>
            <h3 className="text-lg font-medium mb-3">Azure Resources</h3>
            
            <div>
              <h4 className="font-medium mb-2">Virtual Machines</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        VM ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Size
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        CPU Utilization
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Potential Savings
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.azure.virtualMachines.map((vm, index) => (
                      <tr 
                        key={index} 
                        className={
                          vm.lowUtilization ? 'bg-yellow-50' : (index % 2 === 0 ? 'bg-white' : 'bg-gray-50')
                        }
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {vm.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {vm.size}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-32 bg-gray-200 rounded h-2.5 mr-2">
                              <div 
                                className={`h-2.5 rounded ${
                                  vm.cpuUtilization > 70 ? 'bg-red-600' :
                                  vm.cpuUtilization > 30 ? 'bg-blue-600' :
                                  'bg-yellow-600'
                                }`}
                                style={{ width: `${vm.cpuUtilization}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-500">{vm.cpuUtilization.toFixed(1)}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {vm.lowUtilization ? (
                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              Underutilized
                            </span>
                          ) : (
                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Optimal
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {vm.potentialSavings > 0 ? (
                            <span className="text-green-600">${vm.potentialSavings.toFixed(2)}/month</span>
                          ) : (
                            '-'
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Alerts Tab Component
const AlertsTab = ({ alerts, onAcknowledgeAlert }) => {
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [selectedProvider, setSelectedProvider] = useState('all');
  
  // Filter alerts
  const filteredAlerts = alerts.filter(alert => {
    if (selectedSeverity !== 'all' && alert.severity !== selectedSeverity) {
      return false;
    }
    
    if (selectedProvider !== 'all' && alert.provider !== selectedProvider) {
      return false;
    }
    
    return true;
  });
  
  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Active Alerts</h2>
          
          <div className="flex space-x-4">
            <select
              className="border rounded px-3 py-1"
              value={selectedSeverity}
              onChange={e => setSelectedSeverity(e.target.value)}
            >
              <option value="all">All Severities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            
            <select
              className="border rounded px-3 py-1"
              value={selectedProvider}
              onChange={e => setSelectedProvider(e.target.value)}
            >
              <option value="all">All Providers</option>
              <option value="aws">AWS</option>
              <option value="azure">Azure</option>
              <option value="gcp">GCP</option>
            </select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Severity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Provider
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAlerts.map((alert, index) => (
                <tr key={index} className={alert.severity === 'high' ? 'bg-red-50' : 
                                           alert.severity === 'medium' ? 'bg-yellow-50' : 
                                           'bg-white'}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      alert.severity === 'high' ? 'bg-red-100 text-red-800' :
                      alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {alert.severity.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {alert.provider.toUpperCase()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {alert.type}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {alert.service ? `${alert.service}: ` : ''}
                    {alert.current ? `Current: ${alert.current.toFixed(2)}, Baseline: ${alert.baseline.toFixed(2)}, Change: ${alert.percentageIncrease.toFixed(1)}%` : ''}
                    {alert.resourceId ? `Resource: ${alert.resourceId}` : ''}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(alert.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      className="text-indigo-600 hover:text-indigo-900"
                      onClick={() => onAcknowledgeAlert(alert.id)}
                    >
                      Acknowledge
                    </button>
                  </td>
                </tr>
              ))}
              
              {filteredAlerts.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                    No alerts found matching your filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MonitoringDashboard;