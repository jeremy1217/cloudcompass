import React, { useState } from 'react';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    general: {
      companyName: 'CloudCompass',
      timezone: 'UTC',
      dateFormat: 'MM/DD/YYYY',
      notificationEmail: 'admin@cloudcompass.com',
    },
    notifications: {
      emailAlerts: true,
      slackAlerts: false,
      costThreshold: 1000,
      performanceAlerts: true,
      securityAlerts: true,
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
    security: {
      twoFactorAuth: true,
      sessionTimeout: 30,
      ipWhitelist: ['192.168.1.0/24'],
      passwordPolicy: {
        minLength: 8,
        requireNumbers: true,
        requireSpecialChars: true,
        expireDays: 90,
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
            <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
              Company Name
            </label>
            <input
              type="text"
              id="companyName"
              value={settings.general.companyName}
              onChange={(e) => handleInputChange('general', 'companyName', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="timezone" className="block text-sm font-medium text-gray-700">
              Timezone
            </label>
            <select
              id="timezone"
              value={settings.general.timezone}
              onChange={(e) => handleInputChange('general', 'timezone', e.target.value)}
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
          <div>
            <label htmlFor="notificationEmail" className="block text-sm font-medium text-gray-700">
              Notification Email
            </label>
            <input
              type="email"
              id="notificationEmail"
              value={settings.general.notificationEmail}
              onChange={(e) => handleInputChange('general', 'notificationEmail', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900">Notification Settings</h3>
        <div className="mt-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Email Alerts</h4>
              <p className="text-sm text-gray-500">Receive alerts via email</p>
            </div>
            <button
              type="button"
              className={`${
                settings.notifications.emailAlerts ? 'bg-blue-600' : 'bg-gray-200'
              } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
              onClick={() => handleInputChange('notifications', 'emailAlerts', !settings.notifications.emailAlerts)}
            >
              <span
                className={`${
                  settings.notifications.emailAlerts ? 'translate-x-5' : 'translate-x-0'
                } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
              />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Slack Alerts</h4>
              <p className="text-sm text-gray-500">Receive alerts in Slack</p>
            </div>
            <button
              type="button"
              className={`${
                settings.notifications.slackAlerts ? 'bg-blue-600' : 'bg-gray-200'
              } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
              onClick={() => handleInputChange('notifications', 'slackAlerts', !settings.notifications.slackAlerts)}
            >
              <span
                className={`${
                  settings.notifications.slackAlerts ? 'translate-x-5' : 'translate-x-0'
                } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
              />
            </button>
          </div>
          <div>
            <label htmlFor="costThreshold" className="block text-sm font-medium text-gray-700">
              Cost Alert Threshold ($)
            </label>
            <input
              type="number"
              id="costThreshold"
              value={settings.notifications.costThreshold}
              onChange={(e) => handleInputChange('notifications', 'costThreshold', parseInt(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
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

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900">Security Settings</h3>
        <div className="mt-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h4>
              <p className="text-sm text-gray-500">Require 2FA for all users</p>
            </div>
            <button
              type="button"
              className={`${
                settings.security.twoFactorAuth ? 'bg-blue-600' : 'bg-gray-200'
              } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
              onClick={() => handleInputChange('security', 'twoFactorAuth', !settings.security.twoFactorAuth)}
            >
              <span
                className={`${
                  settings.security.twoFactorAuth ? 'translate-x-5' : 'translate-x-0'
                } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
              />
            </button>
          </div>

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
            <label htmlFor="ipWhitelist" className="block text-sm font-medium text-gray-700">
              IP Whitelist
            </label>
            <textarea
              id="ipWhitelist"
              value={settings.security.ipWhitelist.join('\n')}
              onChange={(e) => handleInputChange('security', 'ipWhitelist', e.target.value.split('\n'))}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Enter one IP range per line"
            />
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h4 className="text-sm font-medium text-gray-900">Password Policy</h4>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="minLength" className="block text-sm font-medium text-gray-700">
                  Minimum Length
                </label>
                <input
                  type="number"
                  id="minLength"
                  value={settings.security.passwordPolicy.minLength}
                  onChange={(e) => handleNestedInputChange('security', 'passwordPolicy', 'minLength', parseInt(e.target.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="expireDays" className="block text-sm font-medium text-gray-700">
                  Password Expiry (days)
                </label>
                <input
                  type="number"
                  id="expireDays"
                  value={settings.security.passwordPolicy.expireDays}
                  onChange={(e) => handleNestedInputChange('security', 'passwordPolicy', 'expireDays', parseInt(e.target.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
            </div>
            <div className="mt-4 space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="requireNumbers"
                  checked={settings.security.passwordPolicy.requireNumbers}
                  onChange={(e) => handleNestedInputChange('security', 'passwordPolicy', 'requireNumbers', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="requireNumbers" className="ml-2 block text-sm text-gray-900">
                  Require Numbers
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="requireSpecialChars"
                  checked={settings.security.passwordPolicy.requireSpecialChars}
                  onChange={(e) => handleNestedInputChange('security', 'passwordPolicy', 'requireSpecialChars', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="requireSpecialChars" className="ml-2 block text-sm text-gray-900">
                  Require Special Characters
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
        <p className="mt-1 text-sm text-gray-500">
          Manage your application settings and preferences
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
            onClick={() => setActiveTab('notifications')}
            className={`${
              activeTab === 'notifications'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Notifications
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
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'general' && renderGeneralSettings()}
        {activeTab === 'notifications' && renderNotificationSettings()}
        {activeTab === 'integrations' && renderIntegrationSettings()}
        {activeTab === 'security' && renderSecuritySettings()}
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

export default Settings; 