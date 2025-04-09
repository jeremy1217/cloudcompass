import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';

const MigrationPlanDetail = () => {
  const { planId } = useParams();
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data for migration plan details
  const plan = {
    id: planId,
    name: 'Production Database Migration',
    sourceProvider: 'AWS',
    targetProvider: 'GCP',
    status: 'in-progress',
    progress: 65,
    startDate: '2024-03-01',
    estimatedCompletion: '2024-04-15',
    resources: 12,
    complexity: 'high',
    description: 'Migration of production databases from AWS RDS to Google Cloud SQL, including data transfer and application updates.',
    timeline: [
      {
        id: '1',
        phase: 'Planning',
        status: 'completed',
        startDate: '2024-02-15',
        endDate: '2024-02-28',
        tasks: 5,
        completedTasks: 5,
      },
      {
        id: '2',
        phase: 'Preparation',
        status: 'completed',
        startDate: '2024-03-01',
        endDate: '2024-03-10',
        tasks: 8,
        completedTasks: 8,
      },
      {
        id: '3',
        phase: 'Migration',
        status: 'in-progress',
        startDate: '2024-03-11',
        endDate: '2024-04-05',
        tasks: 12,
        completedTasks: 8,
      },
      {
        id: '4',
        phase: 'Testing',
        status: 'pending',
        startDate: '2024-04-06',
        endDate: '2024-04-10',
        tasks: 6,
        completedTasks: 0,
      },
      {
        id: '5',
        phase: 'Cutover',
        status: 'pending',
        startDate: '2024-04-11',
        endDate: '2024-04-15',
        tasks: 4,
        completedTasks: 0,
      },
    ],
    resources: [
      {
        id: '1',
        name: 'Production Database',
        type: 'RDS',
        sourceId: 'db-12345678',
        targetId: 'gcp-sql-123456',
        status: 'migrated',
      },
      {
        id: '2',
        name: 'Backup Database',
        type: 'RDS',
        sourceId: 'db-87654321',
        targetId: 'gcp-sql-876543',
        status: 'in-progress',
      },
      {
        id: '3',
        name: 'Analytics Database',
        type: 'RDS',
        sourceId: 'db-11223344',
        targetId: 'gcp-sql-112233',
        status: 'pending',
      },
    ],
    risks: [
      {
        id: '1',
        description: 'Data consistency during migration',
        severity: 'high',
        mitigation: 'Implement data validation checks and rollback procedures',
        status: 'addressed',
      },
      {
        id: '2',
        description: 'Application downtime during cutover',
        severity: 'medium',
        mitigation: 'Schedule cutover during maintenance window',
        status: 'pending',
      },
      {
        id: '3',
        description: 'Performance impact on target environment',
        severity: 'low',
        mitigation: 'Conduct performance testing before cutover',
        status: 'addressed',
      },
    ],
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

  const getSeverityColor = (severity) => {
    switch (severity) {
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

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900">Plan Details</h3>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm text-gray-500">Source Provider</p>
            <p className="text-sm font-medium text-gray-900">{plan.sourceProvider}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Target Provider</p>
            <p className="text-sm font-medium text-gray-900">{plan.targetProvider}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Start Date</p>
            <p className="text-sm font-medium text-gray-900">{plan.startDate}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Estimated Completion</p>
            <p className="text-sm font-medium text-gray-900">{plan.estimatedCompletion}</p>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-sm text-gray-500">Description</p>
          <p className="mt-1 text-sm text-gray-900">{plan.description}</p>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900">Timeline</h3>
        <div className="mt-4 space-y-4">
          {plan.timeline.map((phase) => (
            <div key={phase.id} className="flex items-center">
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">{phase.phase}</p>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(phase.status)}`}>
                    {phase.status}
                  </span>
                </div>
                <div className="mt-1">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{ width: `${(phase.completedTasks / phase.tasks) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {phase.completedTasks} of {phase.tasks} tasks completed
                  </p>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {phase.startDate} - {phase.endDate}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderResources = () => (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Resource
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Source ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Target ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {plan.resources.map((resource) => (
            <tr key={resource.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {resource.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {resource.type}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {resource.sourceId}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {resource.targetId}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(resource.status)}`}>
                  {resource.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderRisks = () => (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Risk Description
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Severity
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Mitigation
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {plan.risks.map((risk) => (
            <tr key={risk.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {risk.description}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(risk.severity)}`}>
                  {risk.severity}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {risk.mitigation}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(risk.status)}`}>
                  {risk.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{plan.name}</h2>
          <p className="mt-1 text-sm text-gray-500">
            Migration from {plan.sourceProvider} to {plan.targetProvider}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusColor(plan.status)}`}>
            {plan.status}
          </span>
          <Link
            to="/migration-plans"
            className="text-blue-600 hover:text-blue-900"
          >
            Back to Plans
          </Link>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-medium text-gray-900">Overall Progress</h3>
          <span className="text-sm font-medium text-gray-900">{plan.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full"
            style={{ width: `${plan.progress}%` }}
          ></div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('resources')}
            className={`${
              activeTab === 'resources'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Resources
          </button>
          <button
            onClick={() => setActiveTab('risks')}
            className={`${
              activeTab === 'risks'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Risks
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'resources' && renderResources()}
        {activeTab === 'risks' && renderRisks()}
      </div>
    </div>
  );
};

export default MigrationPlanDetail; 