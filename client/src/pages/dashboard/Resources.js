import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Resources = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('all');

  // Mock data for resources
  const resources = [
    {
      id: '1',
      name: 'Production Web Server',
      type: 'EC2',
      provider: 'AWS',
      status: 'Running',
      region: 'us-west-2',
      cost: '$120/month',
      lastUpdated: '2 hours ago',
    },
    {
      id: '2',
      name: 'Database Cluster',
      type: 'RDS',
      provider: 'AWS',
      status: 'Running',
      region: 'us-east-1',
      cost: '$450/month',
      lastUpdated: '1 day ago',
    },
    {
      id: '3',
      name: 'Storage Bucket',
      type: 'Cloud Storage',
      provider: 'GCP',
      status: 'Active',
      region: 'us-central1',
      cost: '$85/month',
      lastUpdated: '3 hours ago',
    },
    {
      id: '4',
      name: 'Load Balancer',
      type: 'Load Balancer',
      provider: 'Azure',
      status: 'Running',
      region: 'eastus',
      cost: '$75/month',
      lastUpdated: '5 hours ago',
    },
  ];

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProvider = selectedProvider === 'all' || resource.provider === selectedProvider;
    return matchesSearch && matchesProvider;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Cloud Resources</h2>
        <p className="mt-1 text-sm text-gray-500">
          View and manage your cloud resources across different providers
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search resources..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-48">
          <select
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedProvider}
            onChange={(e) => setSelectedProvider(e.target.value)}
          >
            <option value="all">All Providers</option>
            <option value="AWS">AWS</option>
            <option value="GCP">Google Cloud</option>
            <option value="Azure">Azure</option>
          </select>
        </div>
      </div>

      {/* Resources Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Provider
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Updated
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredResources.map((resource) => (
                <tr key={resource.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      to={`/resources/${resource.id}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      {resource.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {resource.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {resource.provider}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      resource.status === 'Running' || resource.status === 'Active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {resource.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {resource.cost}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {resource.lastUpdated}
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

export default Resources; 