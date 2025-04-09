import React from 'react';
import { useParams, Link } from 'react-router-dom';

const ResourceDetail = () => {
  const { resourceId } = useParams();

  // Mock data for resource details
  const resource = {
    id: resourceId,
    name: 'Production Web Server',
    type: 'EC2',
    provider: 'AWS',
    status: 'Running',
    region: 'us-west-2',
    cost: '$120/month',
    lastUpdated: '2 hours ago',
    specifications: {
      instanceType: 't3.large',
      vCPUs: 2,
      memory: '8 GiB',
      storage: '100 GiB',
      operatingSystem: 'Amazon Linux 2',
    },
    tags: ['production', 'web-server', 'high-availability'],
    metrics: {
      cpuUtilization: '45%',
      memoryUsage: '60%',
      networkIn: '1.2 MB/s',
      networkOut: '0.8 MB/s',
    },
    securityGroups: ['sg-12345678', 'sg-87654321'],
    connectedResources: [
      { name: 'Database Cluster', type: 'RDS', id: '2' },
      { name: 'Load Balancer', type: 'Load Balancer', id: '4' },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{resource.name}</h2>
          <p className="mt-1 text-sm text-gray-500">
            {resource.type} • {resource.provider} • {resource.region}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${
            resource.status === 'Running' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {resource.status}
          </span>
          <Link
            to="/resources"
            className="text-blue-600 hover:text-blue-900"
          >
            Back to Resources
          </Link>
        </div>
      </div>

      {/* Resource Details */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Specifications */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Specifications</h3>
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            {Object.entries(resource.specifications).map(([key, value]) => (
              <div key={key}>
                <dt className="text-sm font-medium text-gray-500">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </dt>
                <dd className="mt-1 text-sm text-gray-900">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Metrics */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Metrics</h3>
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            {Object.entries(resource.metrics).map(([key, value]) => (
              <div key={key}>
                <dt className="text-sm font-medium text-gray-500">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </dt>
                <dd className="mt-1 text-sm text-gray-900">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Tags */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {resource.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Connected Resources */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Connected Resources</h3>
          <ul className="divide-y divide-gray-200">
            {resource.connectedResources.map((connected) => (
              <li key={connected.id} className="py-3">
                <Link
                  to={`/resources/${connected.id}`}
                  className="text-blue-600 hover:text-blue-900"
                >
                  {connected.name}
                </Link>
                <p className="text-sm text-gray-500">{connected.type}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Security Groups */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Security Groups</h3>
        <ul className="divide-y divide-gray-200">
          {resource.securityGroups.map((sg) => (
            <li key={sg} className="py-3">
              <span className="text-sm font-medium text-gray-900">{sg}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ResourceDetail; 