import React, { useState } from 'react';

const Monitoring = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [selectedMetric, setSelectedMetric] = useState('all');

  // Mock data for metrics
  const metrics = [
    {
      id: '1',
      name: 'CPU Utilization',
      value: '65%',
      trend: 'up',
      change: '+5%',
      status: 'warning',
      data: [30, 45, 60, 55, 70, 65, 75, 80, 70, 65],
    },
    {
      id: '2',
      name: 'Memory Usage',
      value: '45%',
      trend: 'down',
      change: '-10%',
      status: 'normal',
      data: [55, 50, 45, 40, 45, 50, 45, 40, 45, 45],
    },
    {
      id: '3',
      name: 'Network Traffic',
      value: '2.5 Gbps',
      trend: 'up',
      change: '+0.5 Gbps',
      status: 'normal',
      data: [1.5, 1.8, 2.0, 2.2, 2.5, 2.3, 2.4, 2.5, 2.4, 2.5],
    },
    {
      id: '4',
      name: 'Disk I/O',
      value: '1200 IOPS',
      trend: 'stable',
      change: '0',
      status: 'normal',
      data: [1200, 1150, 1200, 1250, 1200, 1150, 1200, 1250, 1200, 1200],
    },
  ];

  // Mock data for alerts
  const alerts = [
    {
      id: '1',
      severity: 'high',
      message: 'CPU utilization above 80% for 15 minutes',
      resource: 'Production Server',
      timestamp: '2024-03-20 14:30:00',
      status: 'active',
    },
    {
      id: '2',
      severity: 'medium',
      message: 'Memory usage approaching threshold',
      resource: 'Database Server',
      timestamp: '2024-03-20 13:45:00',
      status: 'active',
    },
    {
      id: '3',
      severity: 'low',
      message: 'Network latency increased',
      resource: 'Load Balancer',
      timestamp: '2024-03-20 12:15:00',
      status: 'resolved',
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'normal':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Resource Monitoring</h2>
        <p className="mt-1 text-sm text-gray-500">
          Track your cloud resources and receive alerts
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="w-full sm:w-48">
          <select
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
        </div>
        <div className="w-full sm:w-48">
          <select
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
          >
            <option value="all">All Metrics</option>
            <option value="cpu">CPU</option>
            <option value="memory">Memory</option>
            <option value="network">Network</option>
            <option value="disk">Disk</option>
          </select>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <div key={metric.id} className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900">{metric.name}</h3>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(metric.status)}`}>
                {metric.status}
              </span>
            </div>
            <div className="mt-2">
              <p className="text-2xl font-semibold text-gray-900">{metric.value}</p>
              <div className="flex items-center mt-1">
                <span className={`text-sm ${metric.trend === 'up' ? 'text-red-600' : metric.trend === 'down' ? 'text-green-600' : 'text-gray-600'}`}>
                  {metric.change}
                </span>
                <span className="ml-1 text-sm text-gray-500">vs previous period</span>
              </div>
            </div>
            {/* Simple line chart placeholder */}
            <div className="mt-4 h-20 bg-gray-50 rounded">
              {/* Chart would be implemented here */}
            </div>
          </div>
        ))}
      </div>

      {/* Alerts Section */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Active Alerts</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {alerts.map((alert) => (
            <div key={alert.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                  <p className="mt-1 text-sm text-gray-500">{alert.resource}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(alert.severity)}`}>
                    {alert.severity}
                  </span>
                  <span className="text-sm text-gray-500">{alert.timestamp}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Resource Status */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Resource Status</h3>
        </div>
        <div className="divide-y divide-gray-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Production Server</p>
                <p className="mt-1 text-sm text-gray-500">AWS EC2 t3.large</p>
              </div>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor('warning')}`}>
                warning
              </span>
            </div>
          </div>
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Database Server</p>
                <p className="mt-1 text-sm text-gray-500">AWS RDS db.t3.medium</p>
              </div>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor('normal')}`}>
                normal
              </span>
            </div>
          </div>
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Load Balancer</p>
                <p className="mt-1 text-sm text-gray-500">AWS ALB</p>
              </div>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor('normal')}`}>
                normal
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Monitoring; 