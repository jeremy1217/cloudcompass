import React, { useState } from 'react';

const Recommendations = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Mock data for recommendations
  const recommendations = [
    {
      id: '1',
      title: 'Resize Underutilized EC2 Instances',
      category: 'cost',
      impact: 'high',
      estimatedSavings: '$450/month',
      description: '3 EC2 instances are running at less than 20% CPU utilization. Consider downsizing to smaller instance types.',
      affectedResources: ['i-1234567890', 'i-0987654321', 'i-1122334455'],
      status: 'pending',
    },
    {
      id: '2',
      title: 'Enable Auto-Scaling for Web Servers',
      category: 'performance',
      impact: 'medium',
      estimatedSavings: 'N/A',
      description: 'Web servers are experiencing high load during peak hours. Implement auto-scaling to handle traffic spikes.',
      affectedResources: ['i-1234567890', 'i-0987654321'],
      status: 'in-progress',
    },
    {
      id: '3',
      title: 'Clean Up Unused EBS Volumes',
      category: 'cost',
      impact: 'low',
      estimatedSavings: '$120/month',
      description: '5 EBS volumes are unattached and unused. Consider deleting them to reduce costs.',
      affectedResources: ['vol-12345678', 'vol-87654321', 'vol-11223344', 'vol-44332211', 'vol-55667788'],
      status: 'completed',
    },
    {
      id: '4',
      title: 'Implement CloudFront for Static Content',
      category: 'performance',
      impact: 'high',
      estimatedSavings: 'N/A',
      description: 'Static content is being served directly from EC2 instances. Use CloudFront to improve performance and reduce load.',
      affectedResources: ['i-1234567890'],
      status: 'pending',
    },
  ];

  const filteredRecommendations = recommendations.filter(rec => 
    selectedCategory === 'all' || rec.category === selectedCategory
  );

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Optimization Recommendations</h2>
        <p className="mt-1 text-sm text-gray-500">
          Get suggestions to optimize your cloud resources and reduce costs
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="w-full sm:w-48">
          <select
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="cost">Cost Optimization</option>
            <option value="performance">Performance</option>
            <option value="security">Security</option>
          </select>
        </div>
      </div>

      {/* Recommendations List */}
      <div className="space-y-4">
        {filteredRecommendations.map((rec) => (
          <div key={rec.id} className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">{rec.title}</h3>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getImpactColor(rec.impact)}`}>
                    {rec.impact} impact
                  </span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(rec.status)}`}>
                    {rec.status}
                  </span>
                </div>
              </div>
              
              <p className="mt-2 text-sm text-gray-500">{rec.description}</p>
              
              {rec.estimatedSavings !== 'N/A' && (
                <div className="mt-4">
                  <span className="text-sm font-medium text-gray-900">Estimated Savings: </span>
                  <span className="text-sm text-green-600">{rec.estimatedSavings}</span>
                </div>
              )}

              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-900">Affected Resources:</h4>
                <div className="mt-2 flex flex-wrap gap-2">
                  {rec.affectedResources.map((resource) => (
                    <span
                      key={resource}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                    >
                      {resource}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Dismiss
                </button>
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Implement
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Recommendations; 