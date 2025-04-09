import React, { useState } from 'react';

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    general: {
      appName: 'CloudCompass',
      appLogo: '',
      defaultTimezone: 'UTC',
      dateFormat: 'MM/DD/YYYY',
      maintenanceMode: false,
    },
    email: {
      smtpHost: 'smtp.example.com',
      smtpPort: 587,
      smtpUsername: 'admin@example.com',
      smtpPassword: '••••••••',
      fromEmail: 'noreply@example.com',
      fromName: 'CloudCompass',
    },
    security: {
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      lockoutDuration: 30,
      require2FA: false,
      allowedIPs: ['192.168.1.0/24'],
    },
    integrations: {
      aws: {
        enabled: true,
        accessKey: '••••••••••••••••',
        secretKey: '••••••••••••••••',
        regions: ['us-east-1', 'us-west-2'],
      },
      azure: {
        enabled: false,
        clientId: '',
        clientSecret: '',
        subscriptionId: '',
      },
      gcp: {
        enabled: false,
        projectId: '',
        serviceAccount: '',
      },
    },
  });

  const handleInputChange = (section, field, value) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleNestedInputChange = (section, subsection, field, value) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: {
          ...prev[section][subsection],
          [field]: value,
        },
      },
    }));
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900">General Settings</h3>
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="appName" className="block text-sm font-medium text-gray-700">
              Application Name
            </label>
            <input
              type="text"
              id="appName"
              value={settings.general.appName}
              onChange={(e) => handleInputChange('general', 'appName', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="defaultTimezone" className="block text-sm font-medium text-gray-700">
              Default Timezone
            </label>
            <select
              id="defaultTimezone"
              value={settings.general.defaultTimezone}
              onChange={(e) => handleInputChange('general', 'defaultTimezone', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="UTC">UTC</option>
              <option value="EST">Eastern Time</option>
              <option value="PST">Pacific Time</option>
            </select>
          </div>
          <div>
            <label htmlFor="dateFormat" className="block text-sm font-medium text-gray-700">
              Date Format
            </label>
            <select
              id="dateFormat"
              value={settings.general.dateFormat}
              onChange={(e) => handleInputChange('general', 'dateFormat', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Maintenance Mode</h4>
              <p className="text-sm text-gray-500">Put the application in maintenance mode</p>
            </div>
            <button
              type="button"
              className={`${
                settings.general.maintenanceMode ? 'bg-blue-600' : 'bg-gray-200'
              } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
              onClick={() => handleInputChange('general', 'maintenanceMode', !settings.general.maintenanceMode)}
            >
              <span
                className={`${
                  settings.general.maintenanceMode ? 'translate-x-5' : 'translate-x-0'
                } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEmailSettings = () => (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900">Email Settings</h3>
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="smtpHost" className="block text-sm font-medium text-gray-700">
              SMTP Host
            </label>
            <input
              type="text"
              id="smtpHost"
              value={settings.email.smtpHost}
              onChange={(e) => handleInputChange('email', 'smtpHost', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="smtpPort" className="block text-sm font-medium text-gray-700">
              SMTP Port
            </label>
            <input
              type="number"
              id="smtpPort"
              value={settings.email.smtpPort}
              onChange={(e) => handleInputChange('email', 'smtpPort', parseInt(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="smtpUsername" className="block text-sm font-medium text-gray-700">
              SMTP Username
            </label>
            <input
              type="text"
              id="smtpUsername"
              value={settings.email.smtpUsername}
              onChange={(e) => handleInputChange('email', 'smtpUsername', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="smtpPassword" className="block text-sm font-medium text-gray-700">
              SMTP Password
            </label>
            <input
              type="password"
              id="smtpPassword"
              value={settings.email.smtpPassword}
              onChange={(e) => handleInputChange('email', 'smtpPassword', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="fromEmail" className="block text-sm font-medium text-gray-700">
              From Email
            </label>
            <input
              type="email"
              id="fromEmail"
              value={settings.email.fromEmail}
              onChange={(e) => handleInputChange('email', 'fromEmail', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="fromName" className="block text-sm font-medium text-gray-700">
              From Name
            </label>
            <input
              type="text"
              id="fromName"
              value={settings.email.fromName}
              onChange={(e) => handleInputChange('email', 'fromName', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900">Security Settings</h3>
        <div className="mt-6 space-y-6">
          <div>
            <label htmlFor="sessionTimeout" className="block text-sm font-medium text-gray-700">
              Session Timeout (minutes)
            </label>
            <input
              type="number"
              id="sessionTimeout"
              value={settings.security.sessionTimeout}
              onChange={(e) => handleInputChange('security', 'sessionTimeout', parseInt(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="maxLoginAttempts" className="block text-sm font-medium text-gray-700">
              Maximum Login Attempts
            </label>
            <input
              type="number"
              id="maxLoginAttempts"
              value={settings.security.maxLoginAttempts}
              onChange={(e) => handleInputChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="lockoutDuration" className="block text-sm font-medium text-gray-700">
              Lockout Duration (minutes)
            </label>
            <input
              type="number"
              id="lockoutDuration"
              value={settings.security.lockoutDuration}
              onChange={(e) => handleInputChange('security', 'lockoutDuration', parseInt(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Require Two-Factor Authentication</h4>
              <p className="text-sm text-gray-500">Force all users to enable 2FA</p>
            </div>
            <button
              type="button"
              className={`${
                settings.security.require2FA ? 'bg-blue-600' : 'bg-gray-200'
              } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
              onClick={() => handleInputChange('security', 'require2FA', !settings.security.require2FA)}
            >
              <span
                className={`${
                  settings.security.require2FA ? 'translate-x-5' : 'translate-x-0'
                } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
              />
            </button>
          </div>
          <div>
            <label htmlFor="allowedIPs" className="block text-sm font-medium text-gray-700">
              Allowed IP Ranges
            </label>
            <textarea
              id="allowedIPs"
              value={settings.security.allowedIPs.join('\n')}
              onChange={(e) => handleInputChange('security', 'allowedIPs', e.target.value.split('\n'))}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Enter one IP range per line"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderIntegrationSettings = () => (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900">Cloud Provider Integrations</h3>
        <div className="mt-6 space-y-6">
          {/* AWS Integration */}
          <div className="border-b border-gray-200 pb-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Amazon Web Services</h4>
                <p className="text-sm text-gray-500">Connect your AWS account</p>
              </div>
              <button
                type="button"
                className={`${
                  settings.integrations.aws.enabled ? 'bg-blue-600' : 'bg-gray-200'
                } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                onClick={() => handleNestedInputChange('integrations', 'aws', 'enabled', !settings.integrations.aws.enabled)}
              >
                <span
                  className={`${
                    settings.integrations.aws.enabled ? 'translate-x-5' : 'translate-x-0'
                  } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                />
              </button>
            </div>
            {settings.integrations.aws.enabled && (
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="awsAccessKey" className="block text-sm font-medium text-gray-700">
                    Access Key
                  </label>
                  <input
                    type="password"
                    id="awsAccessKey"
                    value={settings.integrations.aws.accessKey}
                    onChange={(e) => handleNestedInputChange('integrations', 'aws', 'accessKey', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="awsSecretKey" className="block text-sm font-medium text-gray-700">
                    Secret Key
                  </label>
                  <input
                    type="password"
                    id="awsSecretKey"
                    value={settings.integrations.aws.secretKey}
                    onChange={(e) => handleNestedInputChange('integrations', 'aws', 'secretKey', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Azure Integration */}
          <div className="border-b border-gray-200 pb-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Microsoft Azure</h4>
                <p className="text-sm text-gray-500">Connect your Azure subscription</p>
              </div>
              <button
                type="button"
                className={`${
                  settings.integrations.azure.enabled ? 'bg-blue-600' : 'bg-gray-200'
                } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                onClick={() => handleNestedInputChange('integrations', 'azure', 'enabled', !settings.integrations.azure.enabled)}
              >
                <span
                  className={`${
                    settings.integrations.azure.enabled ? 'translate-x-5' : 'translate-x-0'
                  } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                />
              </button>
            </div>
            {settings.integrations.azure.enabled && (
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="azureClientId" className="block text-sm font-medium text-gray-700">
                    Client ID
                  </label>
                  <input
                    type="text"
                    id="azureClientId"
                    value={settings.integrations.azure.clientId}
                    onChange={(e) => handleNestedInputChange('integrations', 'azure', 'clientId', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="azureClientSecret" className="block text-sm font-medium text-gray-700">
                    Client Secret
                  </label>
                  <input
                    type="password"
                    id="azureClientSecret"
                    value={settings.integrations.azure.clientSecret}
                    onChange={(e) => handleNestedInputChange('integrations', 'azure', 'clientSecret', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            )}
          </div>

          {/* GCP Integration */}
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Google Cloud Platform</h4>
                <p className="text-sm text-gray-500">Connect your GCP project</p>
              </div>
              <button
                type="button"
                className={`${
                  settings.integrations.gcp.enabled ? 'bg-blue-600' : 'bg-gray-200'
                } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                onClick={() => handleNestedInputChange('integrations', 'gcp', 'enabled', !settings.integrations.gcp.enabled)}
              >
                <span
                  className={`${
                    settings.integrations.gcp.enabled ? 'translate-x-5' : 'translate-x-0'
                  } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                />
              </button>
            </div>
            {settings.integrations.gcp.enabled && (
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="gcpProjectId" className="block text-sm font-medium text-gray-700">
                    Project ID
                  </label>
                  <input
                    type="text"
                    id="gcpProjectId"
                    value={settings.integrations.gcp.projectId}
                    onChange={(e) => handleNestedInputChange('integrations', 'gcp', 'projectId', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="gcpServiceAccount" className="block text-sm font-medium text-gray-700">
                    Service Account
                  </label>
                  <input
                    type="text"
                    id="gcpServiceAccount"
                    value={settings.integrations.gcp.serviceAccount}
                    onChange={(e) => handleNestedInputChange('integrations', 'gcp', 'serviceAccount', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Admin Settings</h2>
        <p className="mt-1 text-sm text-gray-500">
          Manage application-wide settings and configurations
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('general')}
            className={`${
              activeTab === 'general'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            General
          </button>
          <button
            onClick={() => setActiveTab('email')}
            className={`${
              activeTab === 'email'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Email
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`${
              activeTab === 'security'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Security
          </button>
          <button
            onClick={() => setActiveTab('integrations')}
            className={`${
              activeTab === 'integrations'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Integrations
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'general' && renderGeneralSettings()}
        {activeTab === 'email' && renderEmailSettings()}
        {activeTab === 'security' && renderSecuritySettings()}
        {activeTab === 'integrations' && renderIntegrationSettings()}
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          type="button"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default AdminSettings; 