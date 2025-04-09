import React from 'react';

const Overview = () => {
  // Mock data for the overview
  const stats = [
    { name: 'Total Resources', value: '156', change: '+12%', changeType: 'increase' },
    { name: 'Monthly Cost', value: '$12,450', change: '-8%', changeType: 'decrease' },
    { name: 'Active Services', value: '23', change: '+3', changeType: 'increase' },
    { name: 'Optimization Score', value: '85%', change: '+5%', changeType: 'increase' },
  ];

  const recentActivity = [
    { id: 1, type: 'Resource Added', description: 'New EC2 instance created in us-west-2', time: '2 hours ago' },
    { id: 2, type: 'Cost Alert', description: 'Lambda function costs exceeded threshold', time: '5 hours ago' },
    { id: 3, type: 'Optimization', description: 'Recommended to resize 3 underutilized instances', time: '1 day ago' },
    { id: 4, type: 'Security', description: 'Updated security group configurations', time: '2 days ago' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
        <p className="mt-1 text-sm text-gray-500">
          Monitor your cloud resources, costs, and optimization opportunities
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">{stat.value}</dd>
              <div className={`mt-2 flex items-center text-sm ${
                stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
              }`}>
                <span className="font-medium">{stat.change}</span>
                <span className="ml-2">from last month</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Recent Activity</h3>
        </div>
        <div className="border-t border-gray-200">
          <ul className="divide-y divide-gray-200">
            {recentActivity.map((activity) => (
              <li key={activity.id} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                        activity.type === 'Cost Alert' ? 'bg-red-100' :
                        activity.type === 'Optimization' ? 'bg-yellow-100' :
                        activity.type === 'Security' ? 'bg-blue-100' : 'bg-green-100'
                      }`}>
                        {activity.type === 'Cost Alert' ? '💰' :
                         activity.type === 'Optimization' ? '⚡' :
                         activity.type === 'Security' ? '🔒' : '➕'}
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">{activity.type}</p>
                      <p className="text-sm text-gray-500">{activity.description}</p>
                    </div>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    <span className="text-sm text-gray-500">{activity.time}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Overview; 