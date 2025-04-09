import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const MigrationPlans = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Mock data for migration plans
  const migrationPlans = [
    {
      id: '1',
      name: 'Production Database Migration',
      sourceProvider: 'AWS',
      targetProvider: 'GCP',
      status: 'in-progress',
      progress: 65,
      startDate: '2024-03-01',
      estimatedCompletion: '2024-04-15',
      resources: 12,
      complexity: 'high',
    },
    {
      id: '2',
      name: 'Web Application Migration',
      sourceProvider: 'Azure',
      targetProvider: 'AWS',
      status: 'completed',
      progress: 100,
      startDate: '2024-02-15',
      estimatedCompletion: '2024-03-15',
      resources: 8,
      complexity: 'medium',
    },
    {
      id: '3',
      name: 'Storage Migration',
      sourceProvider: 'AWS',
      targetProvider: 'Azure',
      status: 'planned',
      progress: 0,
      startDate: '2024-04-01',
      estimatedCompletion: '2024-05-01',
      resources: 5,
      complexity: 'low',
    },
    {
      id: '4',
      name: 'Analytics Platform Migration',
      sourceProvider: 'GCP',
      targetProvider: 'AWS',
      status: 'in-progress',
      progress: 30,
      startDate: '2024-03-10',
      estimatedCompletion: '2024-05-20',
      resources: 15,
      complexity: 'high',
    },
  ];

  const filteredPlans = migrationPlans.filter(plan => {
    const matchesSearch = plan.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || plan.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'planned':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getComplexityColor = (complexity) => {
    switch (complexity) {
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Migration Plans</h2>
        <p className="mt-1 text-sm text-gray-500">
          Manage and track your cloud migration projects
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search migration plans..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-48">
          <select
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="planned">Planned</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Migration Plans List */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {filteredPlans.map((plan) => (
          <div key={plan.id} className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <Link
                  to={`/migration-plans/${plan.id}`}
                  className="text-lg font-medium text-blue-600 hover:text-blue-900"
                >
                  {plan.name}
                </Link>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(plan.status)}`}>
                  {plan.status}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Source Provider</p>
                  <p className="text-sm font-medium text-gray-900">{plan.sourceProvider}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Target Provider</p>
                  <p className="text-sm font-medium text-gray-900">{plan.targetProvider}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Progress</p>
                  <div className="mt-1">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full"
                        style={{ width: `${plan.progress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{plan.progress}%</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Complexity</p>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getComplexityColor(plan.complexity)}`}>
                    {plan.complexity}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                <div>
                  <p>Start Date: {plan.startDate}</p>
                  <p>Estimated Completion: {plan.estimatedCompletion}</p>
                </div>
                <div className="text-right">
                  <p>{plan.resources} Resources</p>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Edit
                </button>
                <Link
                  to={`/migration-plans/${plan.id}`}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MigrationPlans; 