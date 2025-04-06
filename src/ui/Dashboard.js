// src/ui/Dashboard.js
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { PieChart, Pie, Cell } from 'recharts';

// Main dashboard component
const MultiCloudDashboard = ({ 
  cloudDataCollector, 
  workloadClassifier, 
  pricingAnalyzer, 
  recommendationEngine, 
  migrationPlanner 
}) => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [activeView, setActiveView] = useState('overview');
  const [selectedResource, setSelectedResource] = useState(null);
  
  // Load dashboard data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Generate recommendations
        const recommendations = await recommendationEngine.generateRecommendations();
        
        // Format data for dashboard
        const formattedData = {
          resources: recommendations.resources,
          classifiedWorkloads: recommendations.classifiedWorkloads,
          recommendations: recommendations.recommendations,
          summary: {
            resourceCount: countResources(recommendations.resources),
            resourceDistribution: calculateResourceDistribution(recommendations.resources),
            potentialSavings: calculatePotentialSavings(recommendations.recommendations),
            recommendedDistribution: recommendations.recommendations.overallStrategy.summary.distributionRecommendation
          }
        };
        
        setDashboardData(formattedData);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [cloudDataCollector, workloadClassifier, pricingAnalyzer, recommendationEngine]);
  
  // Helper function to count resources
  const countResources = (resources) => {
    let totalCount = 0;
    
    for (const provider of Object.keys(resources)) {
      for (const resourceType of Object.keys(resources[provider])) {
        if (Array.isArray(resources[provider][resourceType])) {
          totalCount += resources[provider][resourceType].length;
        } else if (resources[provider][resourceType].Reservations) {
          // Special handling for EC2 instances
          totalCount += resources[provider][resourceType].Reservations.reduce(
            (sum, reservation) => sum + reservation.Instances.length, 0
          );
        }
      }
    }
    
    return totalCount;
  };
  
  // Helper function to calculate resource distribution
  const calculateResourceDistribution = (resources) => {
    const distribution = {
      aws: 0,
      azure: 0,
      gcp: 0
    };
    
    for (const provider of Object.keys(resources)) {
      for (const resourceType of Object.keys(resources[provider])) {
        if (Array.isArray(resources[provider][resourceType])) {
          distribution[provider] += resources[provider][resourceType].length;
        } else if (resources[provider][resourceType].Reservations) {
          // Special handling for EC2 instances
          distribution[provider] += resources[provider][resourceType].Reservations.reduce(
            (sum, reservation) => sum + reservation.Instances.length, 0
          );
        }
      }
    }
    
    // Convert to percentages
    const total = Object.values(distribution).reduce((sum, count) => sum + count, 0);
    
    if (total > 0) {
      for (const provider of Object.keys(distribution)) {
        distribution[provider] = Math.round((distribution[provider] / total) * 100);
      }
    }
    
    return distribution;
  };
  
  // Helper function to calculate potential savings
  const calculatePotentialSavings = (recommendations) => {
    return {
      monthly: recommendations.resourceRecommendations.reduce(
        (sum, rec) => sum + (rec.estimatedSavings || 0), 0
      ),
      annual: recommendations.resourceRecommendations.reduce(
        (sum, rec) => sum + (rec.estimatedSavings || 0) * 12, 0
      )
    };
  };
  
  // Handler for resource selection
  const handleResourceSelect = (resource) => {
    setSelectedResource(resource);
    setActiveView('resourceDetail');
  };
  
  // Handler for generating a migration plan
  const handleGenerateMigrationPlan = async (resource) => {
    try {
      const plan = migrationPlanner.generateMigrationPlan(resource);
      
      // Update the selected resource with migration plan
      setSelectedResource({
        ...resource,
        migrationPlan: plan
      });
    } catch (error) {
      console.error('Error generating migration plan:', error);
    }
  };
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Failed to load dashboard data</h2>
          <button 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Multi-Cloud Strategy Assistant</h1>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            className={`py-2 px-4 font-medium ${activeView === 'overview' ? 'text-blue-600 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveView('overview')}
          >
            Overview
          </button>
          <button
            className={`py-2 px-4 font-medium ${activeView === 'recommendations' ? 'text-blue-600 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveView('recommendations')}
          >
            Recommendations
          </button>
          <button
            className={`py-2 px-4 font-medium ${activeView === 'workloads' ? 'text-blue-600 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveView('workloads')}
          >
            Workload Analysis
          </button>
          <button
            className={`py-2 px-4 font-medium ${activeView === 'costs' ? 'text-blue-600 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveView('costs')}
          >
            Cost Analysis
          </button>
          <button
            className={`py-2 px-4 font-medium ${activeView === 'migration' ? 'text-blue-600 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveView('migration')}
          >
            Migration Planning
          </button>
          {selectedResource && (
            <button
              className={`py-2 px-4 font-medium ${activeView === 'resourceDetail' ? 'text-blue-600 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveView('resourceDetail')}
            >
              Resource Detail
            </button>
          )}
        </div>
        
        {/* Content based on active view */}
        {activeView === 'overview' && (
          <OverviewView 
            summary={dashboardData.summary} 
            strategy={dashboardData.recommendations.overallStrategy} 
          />
        )}
        
        {activeView === 'recommendations' && (
          <RecommendationsView 
            recommendations={dashboardData.recommendations.resourceRecommendations}
            onResourceSelect={handleResourceSelect}
            strategy={dashboardData.recommendations.overallStrategy}
          />
        )}
        
        {activeView === 'workloads' && (
          <WorkloadsView 
            workloads={dashboardData.classifiedWorkloads}
            onResourceSelect={handleResourceSelect}
          />
        )}
        
        {activeView === 'costs' && (
          <CostsView 
            recommendations={dashboardData.recommendations.resourceRecommendations}
            summary={dashboardData.summary}
          />
        )}
        
        {activeView === 'migration' && (
          <MigrationView 
            strategy={dashboardData.recommendations.overallStrategy}
            recommendations={dashboardData.recommendations.resourceRecommendations}
            onResourceSelect={handleResourceSelect}
            onGenerateMigrationPlan={handleGenerateMigrationPlan}
          />
        )}
        
        {activeView === 'resourceDetail' && selectedResource && (
          <ResourceDetailView 
            resource={selectedResource}
            onGenerateMigrationPlan={handleGenerateMigrationPlan}
          />
        )}
      </main>
    </div>
  );
};

// Overview view component
const OverviewView = ({ summary, strategy }) => {
  // Prepare data for charts
  const currentDistributionData = Object.keys(summary.resourceDistribution).map(provider => ({
    name: provider.toUpperCase(),
    value: summary.resourceDistribution[provider]
  }));
  
  const recommendedDistributionData = Object.keys(summary.recommendedDistribution).map(provider => ({
    name: provider.toUpperCase(),
    value: parseInt(summary.recommendedDistribution[provider].replace('%', ''))
  }));
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];
  
  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Multi-Cloud Strategy Summary</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-blue-800">Total Resources</h3>
            <p className="text-3xl font-bold">{summary.resourceCount}</p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-green-800">Monthly Savings Potential</h3>
            <p className="text-3xl font-bold">${summary.potentialSavings.monthly.toFixed(2)}</p>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-purple-800">Recommended Changes</h3>
            <p className="text-3xl font-bold">{strategy.summary.recommendedMoves}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Current Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={currentDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={({name, value}) => `${name}: ${value}%`}
                  >
                    {currentDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Recommended Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={recommendedDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={({name, value}) => `${name}: ${value}%`}
                  >
                    {recommendedDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Risk Assessment</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <RiskCard 
            title="Vendor Lock-In Risk" 
            level={strategy.riskAssessment.vendorLockInRisk.level}
            description={strategy.riskAssessment.vendorLockInRisk.description}
          />
          
          <RiskCard 
            title="Migration Risk" 
            level={strategy.riskAssessment.migrationRisk.level}
            description={strategy.riskAssessment.migrationRisk.description}
          />
          
          <RiskCard 
            title="Cost Variability Risk" 
            level={strategy.riskAssessment.costVariabilityRisk}
            description="Risk of unexpected cost increases after migration"
          />
        </div>
        
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-2">Recommended Mitigations</h3>
          <ul className="list-disc pl-5 space-y-1">
            {strategy.riskAssessment.recommendedMitigations.map((mitigation, index) => (
              <li key={index}>{mitigation}</li>
            ))}
          </ul>
        </div>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Migration Strategy</h2>
        
        <div className="space-y-4">
          {strategy.phases.map((phase, index) => (
            <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
              <h3 className="text-lg font-medium">{phase.name}</h3>
              <p className="text-gray-600">{phase.description}</p>
              <p className="mt-1">
                <span className="font-medium">Resources:</span> {phase.resources.length}
                {phase.resources.length > 0 && (
                  <span className="ml-3 font-medium">
                    Savings: ${phase.resources.reduce((sum, r) => sum + (r.estimatedSavings || 0), 0).toFixed(2)}/month
                  </span>
                )}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Risk Card component
const RiskCard = ({ title, level, description }) => {
  const getBgColor = () => {
    switch (level) {
      case 'Low':
        return 'bg-green-50';
      case 'Medium':
        return 'bg-yellow-50';
      case 'High':
        return 'bg-red-50';
      default:
        return 'bg-gray-50';
    }
  };
  
  const getTextColor = () => {
    switch (level) {
      case 'Low':
        return 'text-green-800';
      case 'Medium':
        return 'text-yellow-800';
      case 'High':
        return 'text-red-800';
      default:
        return 'text-gray-800';
    }
  };
  
  const getBorderColor = () => {
    switch (level) {
      case 'Low':
        return 'border-green-200';
      case 'Medium':
        return 'border-yellow-200';
      case 'High':
        return 'border-red-200';
      default:
        return 'border-gray-200';
    }
  };
  
  return (
    <div className={`p-4 rounded-lg border ${getBgColor()} ${getBorderColor()}`}>
      <h3 className="text-lg font-medium">{title}</h3>
      <div className="mt-2 flex items-center">
        <span className={`inline-block px-2 py-1 rounded text-sm font-medium ${getTextColor()}`}>
          {level}
        </span>
      </div>
      <p className="mt-2 text-gray-600">{description}</p>
    </div>
  );
};

// Recommendations View
const RecommendationsView = ({ recommendations, onResourceSelect, strategy }) => {
  const [sortField, setSortField] = useState('estimatedSavings');
  const [sortDirection, setSortDirection] = useState('desc');
  const [filterProvider, setFilterProvider] = useState('all');
  
  // Helper function to sort recommendations
  const sortedRecommendations = [...recommendations].sort((a, b) => {
    if (sortField === 'estimatedSavings') {
      return sortDirection === 'desc' 
        ? (b.estimatedSavings || 0) - (a.estimatedSavings || 0)
        : (a.estimatedSavings || 0) - (b.estimatedSavings || 0);
    } else if (sortField === 'confidenceScore') {
      const scoreA = a.confidenceScore ? parseFloat(a.confidenceScore.replace('%', '')) : 0;
      const scoreB = b.confidenceScore ? parseFloat(b.confidenceScore.replace('%', '')) : 0;
      return sortDirection === 'desc' ? scoreB - scoreA : scoreA - scoreB;
    } else {
      // Default sort by resource ID
      return sortDirection === 'desc' 
        ? b.resourceId.localeCompare(a.resourceId)
        : a.resourceId.localeCompare(b.resourceId);
    }
  });
  
  // Filter by provider
  const filteredRecommendations = filterProvider === 'all' 
    ? sortedRecommendations 
    : sortedRecommendations.filter(r => r.currentProvider === filterProvider);
  
  // Toggle sort direction
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Resource Recommendations</h2>
          
          <div className="flex space-x-4">
            <select
              className="border rounded px-3 py-1"
              value={filterProvider}
              onChange={e => setFilterProvider(e.target.value)}
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
                  Resource ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Resource Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Provider
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Recommended Provider
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('estimatedSavings')}
                >
                  <div className="flex items-center">
                    Estimated Monthly Savings
                    {sortField === 'estimatedSavings' && (
                      <span className="ml-1">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('confidenceScore')}
                >
                  <div className="flex items-center">
                    Confidence
                    {sortField === 'confidenceScore' && (
                      <span className="ml-1">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRecommendations.map((recommendation, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {recommendation.resourceId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {recommendation.resourceType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {recommendation.currentProvider.toUpperCase()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span 
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        recommendation.recommendedProvider !== recommendation.currentProvider
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {recommendation.recommendedProvider.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {recommendation.estimatedSavings > 0 
                      ? `$${recommendation.estimatedSavings.toFixed(2)}`
                      : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {recommendation.confidenceScore}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      className="text-blue-600 hover:text-blue-900"
                      onClick={() => onResourceSelect(recommendation)}
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredRecommendations.length === 0 && (
          <div className="text-center py-4">
            <p className="text-gray-500">No recommendations match your filters.</p>
          </div>
        )}
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Migration Phases</h2>
        
        <div className="space-y-4">
          {strategy.phases.map((phase, index) => (
            <div key={index} className="border rounded-lg p-4">
              <h3 className="text-lg font-medium">{phase.name}</h3>
              <p className="text-gray-600">{phase.description}</p>
              
              <div className="mt-3">
                <h4 className="font-medium mb-2">Resources to Migrate:</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Resource ID
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          From
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          To
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Savings
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {phase.resources.map((resource, resIndex) => (
                        <tr key={resIndex} className={resIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                            {resource.resourceId}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                            {resource.currentProvider.toUpperCase()}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                            {resource.targetProvider.toUpperCase()}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                            ${resource.estimatedSavings?.toFixed(2) || '0.00'}/month
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Workloads View
const WorkloadsView = ({ workloads, onResourceSelect }) => {
  // Prepare data for visualization
  const workloadTypes = {};
  
  // Count workload types
  for (const provider of Object.keys(workloads)) {
    for (const resourceType of Object.keys(workloads[provider])) {
      const resources = workloads[provider][resourceType];
      
      for (const resource of resources) {
        if (resource.primaryType) {
          workloadTypes[resource.primaryType] = (workloadTypes[resource.primaryType] || 0) + 1;
        }
      }
    }
  }
  
  const workloadTypeData = Object.keys(workloadTypes).map(type => ({
    name: type,
    count: workloadTypes[type]
  }));
  
  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Workload Classification</h2>
        
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={workloadTypeData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" name="Number of Resources" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Classified Resources</h2>
        
        <div className="space-y-4">
          {Object.keys(workloads).map(provider => (
            <div key={provider} className="border rounded-lg p-4">
              <h3 className="text-lg font-medium">{provider.toUpperCase()}</h3>
              
              {Object.keys(workloads[provider]).map(resourceType => (
                <div key={resourceType} className="mt-4">
                  <h4 className="font-medium">{resourceType}</h4>
                  
                  <div className="overflow-x-auto mt-2">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Resource ID
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Resource Type
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Primary Workload Type
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Classifications
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {workloads[provider][resourceType].map((resource, index) => (
                          <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                              {resource.resourceId}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                              {resource.resourceType}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                              {resource.primaryType}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                              {resource.classifications.join(', ')}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                className="text-blue-600 hover:text-blue-900"
                                onClick={() => onResourceSelect({
                                  ...resource,
                                  currentProvider: provider
                                })}
                              >
                                Details
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Costs View
const CostsView = ({ recommendations, summary }) => {
  // Group savings by provider
  const savingsByProvider = {};
  
  recommendations.forEach(rec => {
    if (rec.recommendedProvider !== rec.currentProvider && rec.estimatedSavings > 0) {
      const key = `${rec.currentProvider}-to-${rec.recommendedProvider}`;
      savingsByProvider[key] = (savingsByProvider[key] || 0) + rec.estimatedSavings;
    }
  });
  
  const savingsData = Object.keys(savingsByProvider).map(key => ({
    name: key.toUpperCase(),
    savings: savingsByProvider[key]
  }));
  
  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Cost Analysis</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-green-800">Monthly Savings Potential</h3>
            <p className="text-3xl font-bold">${summary.potentialSavings.monthly.toFixed(2)}</p>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-blue-800">Annual Savings Potential</h3>
            <p className="text-3xl font-bold">${summary.potentialSavings.annual.toFixed(2)}</p>
          </div>
        </div>
        
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={savingsData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
              <Legend />
              <Bar dataKey="savings" name="Monthly Savings ($)" fill="#4CAF50" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Top Saving Opportunities</h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Resource ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Provider
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Recommended Provider
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Monthly Cost
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estimated Savings
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Savings %
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recommendations
                .filter(rec => rec.recommendedProvider !== rec.currentProvider && rec.estimatedSavings > 0)
                .sort((a, b) => b.estimatedSavings - a.estimatedSavings)
                .slice(0, 10)
                .map((recommendation, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {recommendation.resourceId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {recommendation.currentProvider.toUpperCase()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {recommendation.recommendedProvider.toUpperCase()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${recommendation.currentCost.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${recommendation.estimatedSavings.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {((recommendation.estimatedSavings / recommendation.currentCost) * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Migration View
const MigrationView = ({ strategy, recommendations, onResourceSelect, onGenerateMigrationPlan }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Migration Strategy</h2>
        
        <p className="mb-4 text-gray-700">
          Based on the analysis of your {recommendations.length} resources, we recommend 
          a phased migration approach with {strategy.phases.length} phases:
        </p>
        
        <div className="space-y-4 mt-6">
          {strategy.phases.map((phase, index) => (
            <div key={index} className="border rounded-lg p-6">
              <h3 className="text-xl font-semibold">{phase.name}</h3>
              <p className="text-gray-600 mb-4">{phase.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-blue-50 p-3 rounded">
                  <p className="text-sm font-medium text-blue-800">Resources</p>
                  <p className="text-2xl font-bold">{phase.resources.length}</p>
                </div>
                
                <div className="bg-green-50 p-3 rounded">
                  <p className="text-sm font-medium text-green-800">Estimated Savings</p>
                  <p className="text-2xl font-bold">
                    ${phase.resources.reduce((sum, r) => sum + (r.estimatedSavings || 0), 0).toFixed(2)}/month
                  </p>
                </div>
                
                <div className="bg-purple-50 p-3 rounded">
                  <p className="text-sm font-medium text-purple-800">Migration Complexity</p>
                  <p className="text-2xl font-bold">
                    {index === 0 ? 'Low' : index === 1 ? 'Medium' : 'High'}
                  </p>
                </div>
              </div>
              
              <div className="overflow-x-auto mt-4">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Resource ID
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Current Provider
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Target Provider
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Monthly Savings
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {phase.resources.map((resource, resIndex) => {
                      // Find full recommendation for this resource
                      const fullRec = recommendations.find(r => r.resourceId === resource.resourceId);
                      
                      return (
                        <tr key={resIndex} className={resIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                            {resource.resourceId}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                            {resource.currentProvider.toUpperCase()}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                            {resource.targetProvider.toUpperCase()}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                            ${(resource.estimatedSavings || 0).toFixed(2)}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                            <button
                              className="text-blue-600 hover:text-blue-900 mr-3"
                              onClick={() => fullRec && onResourceSelect(fullRec)}
                            >
                              Details
                            </button>
                            <button
                              className="text-green-600 hover:text-green-900"
                              onClick={() => fullRec && onGenerateMigrationPlan(fullRec)}
                            >
                              Migration Plan
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Risk Assessment</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <RiskCard 
            title="Vendor Lock-In Risk" 
            level={strategy.riskAssessment.vendorLockInRisk.level}
            description={strategy.riskAssessment.vendorLockInRisk.description}
          />
          
          <RiskCard 
            title="Migration Risk" 
            level={strategy.riskAssessment.migrationRisk.level}
            description={strategy.riskAssessment.migrationRisk.description}
          />
          
          <RiskCard 
            title="Cost Variability Risk" 
            level={strategy.riskAssessment.costVariabilityRisk}
            description="Risk of unexpected cost increases after migration"
          />
        </div>
        
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-2">Recommended Mitigations</h3>
          <ul className="list-disc pl-5 space-y-1">
            {strategy.riskAssessment.recommendedMitigations.map((mitigation, index) => (
              <li key={index}>{mitigation}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

// Resource Detail View
const ResourceDetailView = ({ resource, onGenerateMigrationPlan }) => {
  const [activeTab, setActiveTab] = useState('overview');
  
  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Resource Details: {resource.resourceId}</h2>
          
          {!resource.migrationPlan && resource.currentProvider !== resource.recommendedProvider && (
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={() => onGenerateMigrationPlan(resource)}
            >
              Generate Migration Plan
            </button>
          )}
        </div>
        
        <div className="flex border-b border-gray-200 mb-6">
          <button
            className={`py-2 px-4 font-medium ${activeTab === 'overview' ? 'text-blue-600 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          
          {resource.migrationPlan && (
            <button
              className={`py-2 px-4 font-medium ${activeTab === 'migrationPlan' ? 'text-blue-600 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('migrationPlan')}
            >
              Migration Plan
            </button>
          )}
          
          <button
            className={`py-2 px-4 font-medium ${activeTab === 'details' ? 'text-blue-600 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('details')}
          >
            Technical Details
          </button>
        </div>
        
        {activeTab === 'overview' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-lg font-medium mb-3">Resource Information</h3>
                <div className="bg-gray-50 p-4 rounded">
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Resource ID:</dt>
                      <dd className="font-medium">{resource.resourceId}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Resource Type:</dt>
                      <dd>{resource.resourceType}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Current Provider:</dt>
                      <dd>{resource.currentProvider?.toUpperCase()}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Primary Workload Type:</dt>
                      <dd>{resource.primaryType}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Classifications:</dt>
                      <dd>{resource.classifications?.join(', ')}</dd>
                    </div>
                  </dl>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-3">Recommendation</h3>
                <div className="bg-gray-50 p-4 rounded">
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Recommended Provider:</dt>
                      <dd className={`font-medium ${resource.recommendedProvider !== resource.currentProvider ? 'text-yellow-600' : 'text-green-600'}`}>
                        {resource.recommendedProvider?.toUpperCase()}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Current Monthly Cost:</dt>
                      <dd>${resource.currentCost?.toFixed(2)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Estimated Monthly Savings:</dt>
                      <dd className="text-green-600 font-medium">
                        ${(resource.estimatedSavings || 0).toFixed(2)}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Confidence Score:</dt>
                      <dd>{resource.confidenceScore}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Migration Complexity:</dt>
                      <dd>{resource.migrationComplexity?.level || 'N/A'}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
            
            {resource.reasoning && resource.reasoning.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-3">Reasoning</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {resource.reasoning.map((reason, index) => (
                    <li key={index}>{reason}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'migrationPlan' && resource.migrationPlan && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-lg font-medium mb-3">Migration Strategy</h3>
                <div className="bg-gray-50 p-4 rounded">
                  <p className="font-semibold">{resource.migrationPlan.recommendedStrategy?.name}</p>
                  <p className="text-gray-600 mt-1">{resource.migrationPlan.recommendedStrategy?.description}</p>
                  
                  <div className="mt-4">
                    <p className="font-medium">Best for:</p>
                    <ul className="list-disc pl-5 mt-1">
                      {resource.migrationPlan.recommendedStrategy?.bestFor.map((item, index) => (
                        <li key={index} className="text-gray-600">{item}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-sm text-gray-500">Complexity:</p>
                      <p className="font-medium">{resource.migrationPlan.recommendedStrategy?.complexity}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Risk:</p>
                      <p className="font-medium">{resource.migrationPlan.recommendedStrategy?.risk}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Timeframe:</p>
                      <p className="font-medium">{resource.migrationPlan.recommendedStrategy?.timeframe}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Cost Savings:</p>
                      <p className="font-medium">{resource.migrationPlan.recommendedStrategy?.costSavings}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-3">Migration Details</h3>
                <div className="bg-gray-50 p-4 rounded">
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-gray-500">From Provider:</dt>
                      <dd className="font-medium">{resource.migrationPlan.currentProvider?.toUpperCase()}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">To Provider:</dt>
                      <dd className="font-medium">{resource.migrationPlan.targetProvider?.toUpperCase()}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Estimated Timeframe:</dt>
                      <dd>{resource.migrationPlan.estimatedTimeframe}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Estimated Downtime:</dt>
                      <dd>{resource.migrationPlan.downtime?.estimated}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Savings:</dt>
                      <dd className="text-green-600 font-medium">
                        ${(resource.migrationPlan.estimatedSavings || 0).toFixed(2)}/month
                      </dd>
                    </div>
                  </dl>
                </div>
                
                {resource.migrationPlan.migrationTooling && resource.migrationPlan.migrationTooling.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Recommended Tools:</h4>
                    <ul className="space-y-2">
                      {resource.migrationPlan.migrationTooling.map((tool, index) => (
                        <li key={index} className="bg-blue-50 p-2 rounded">
                          <p className="font-medium">{tool.name}</p>
                          <p className="text-sm text-gray-600">{tool.description}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-3">Migration Steps</h3>
              
              <div className="space-y-4">
                {resource.migrationPlan.steps.map((phaseSteps, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <h4 className="font-medium text-blue-800">{phaseSteps.phase}</h4>
                    
                    <ol className="mt-2 space-y-2">
                      {phaseSteps.steps.map((step, stepIndex) => (
                        <li key={stepIndex} className="ml-6 list-decimal">
                          <p className="font-medium">{step.name}</p>
                          <p className="text-gray-600 text-sm">{step.description}</p>
                        </li>
                      ))}
                    </ol>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <h3 className="text-lg font-medium mb-3">Risks</h3>
                
                <div className="space-y-2">
                  {resource.migrationPlan.risks.map((risk, index) => (
                    <div key={index} className="border-l-4 border-red-500 pl-3 py-2">
                      <p className="font-medium">{risk.type}</p>
                      <p className="text-sm text-gray-600">{risk.description}</p>
                      <p className="text-sm mt-1">
                        <span className="inline-block px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">
                          {risk.severity} Risk
                        </span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-3">Mitigations</h3>
                
                <div className="space-y-2">
                  {resource.migrationPlan.mitigations.map((mitigation, index) => (
                    <div key={index} className="border-l-4 border-green-500 pl-3 py-2">
                      <p className="font-medium">For {mitigation.risk}</p>
                      <p className="text-sm text-gray-600">{mitigation.action}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-3">Downtime Minimization</h3>
              
              <div className="bg-gray-50 p-4 rounded">
                <p className="mb-2">
                  <span className="font-medium">Estimated Downtime:</span> {resource.migrationPlan.downtime?.estimated}
                </p>
                
                <h4 className="font-medium mt-3">Minimization Strategies:</h4>
                <ul className="list-disc pl-5 mt-1">
                  {resource.migrationPlan.downtime?.minimizationStrategies.map((strategy, index) => (
                    <li key={index} className="text-gray-600">{strategy}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'details' && (
          <div>
            <h3 className="text-lg font-medium mb-3">Technical Details</h3>
            
            <pre className="bg-gray-800 text-gray-200 p-4 rounded overflow-x-auto">
              {JSON.stringify(resource, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default MultiCloudDashboard;