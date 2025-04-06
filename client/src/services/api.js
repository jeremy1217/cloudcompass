import axios from 'axios';

// Create axios instance with base URL and timeout
const apiClient = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if available
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  error => Promise.reject(error)
);

// API service object with methods for each endpoint
const apiService = {
  // Resources
  resources: {
    getAll: async (filters = {}) => {
      const response = await apiClient.get('/resources', { params: filters });
      return response.data;
    },
    getById: async (resourceId) => {
      const response = await apiClient.get(`/resources/${resourceId}`);
      return response.data;
    },
    getByProvider: async (provider) => {
      const response = await apiClient.get(`/resources/providers/${provider}`);
      return response.data;
    }
  },
  
  // Recommendations
  recommendations: {
    getAll: async () => {
      const response = await apiClient.get('/recommendations');
      return response.data;
    },
    getStrategy: async () => {
      const response = await apiClient.get('/recommendations/strategy');
      return response.data;
    },
    getSavings: async () => {
      const response = await apiClient.get('/recommendations/savings');
      return response.data;
    },
    getByResource: async (resourceId) => {
      const response = await apiClient.get(`/recommendations/resource/${resourceId}`);
      return response.data;
    },
    generate: async () => {
      const response = await apiClient.post('/recommendations/generate');
      return response.data;
    },
    updateStatus: async (recommendationId, status, notes) => {
      const response = await apiClient.put(`/recommendations/${recommendationId}/status`, { status, notes });
      return response.data;
    },
    export: async () => {
      const response = await apiClient.post('/recommendations/export');
      return response.data;
    }
  },
  
  // Migrations
  migrations: {
    getPlans: async () => {
      const response = await apiClient.get('/migrations/plans');
      return response.data;
    },
    getPlan: async (planId) => {
      const response = await apiClient.get(`/migrations/plans/${planId}`);
      return response.data;
    },
    createPlan: async (resourceId) => {
      const response = await apiClient.post('/migrations/plan', { resourceId });
      return response.data;
    },
    savePlan: async (plan) => {
      const response = await apiClient.post('/migrations/plans', plan);
      return response.data;
    },
    updatePlan: async (planId, updates) => {
      const response = await apiClient.put(`/migrations/plans/${planId}`, updates);
      return response.data;
    },
    deletePlan: async (planId) => {
      const response = await apiClient.delete(`/migrations/plans/${planId}`);
      return response.data;
    },
    executePlan: async (planId) => {
      const response = await apiClient.post(`/migrations/execute/${planId}`);
      return response.data;
    },
    updateStatus: async (planId, status, notes) => {
      const response = await apiClient.post(`/migrations/update-status/${planId}`, { status, notes });
      return response.data;
    },
    getStrategies: async () => {
      const response = await apiClient.get('/migrations/strategies');
      return response.data;
    },
    getTools: async (sourceProvider, targetProvider) => {
      const response = await apiClient.get(`/migrations/tools/${sourceProvider}/${targetProvider}`);
      return response.data;
    }
  },
  
  // Monitoring
  monitoring: {
    getOverview: async () => {
      const response = await apiClient.get('/monitoring/overview');
      return response.data;
    },
    getCosts: async (period) => {
      const response = await apiClient.get('/monitoring/costs', { params: { period } });
      return response.data;
    },
    getPerformance: async (period) => {
      const response = await apiClient.get('/monitoring/performance', { params: { period } });
      return response.data;
    },
    getUtilization: async () => {
      const response = await apiClient.get('/monitoring/utilization');
      return response.data;
    },
    getAlerts: async (filters = {}) => {
      const response = await apiClient.get('/monitoring/alerts', { params: filters });
      return response.data;
    },
    acknowledgeAlert: async (alertId) => {
      const response = await apiClient.post(`/monitoring/alerts/${alertId}/acknowledge`);
      return response.data;
    }
  },
  
  // Dashboard
  dashboard: {
    getOverview: async () => {
      const response = await apiClient.get('/dashboard/overview');
      return response.data;
    },
    getCosts: async (period) => {
      const response = await apiClient.get('/dashboard/costs', { params: { period } });
      return response.data;
    },
    getPerformance: async (period) => {
      const response = await apiClient.get('/dashboard/performance', { params: { period } });
      return response.data;
    },
    getOptimization: async () => {
      const response = await apiClient.get('/dashboard/optimization');
      return response.data;
    },
    getMigrations: async () => {
      const response = await apiClient.get('/dashboard/migrations');
      return response.data;
    }
  },
  
  // Integrations
  integrations: {
    getCloudCostIQ: async () => {
      const response = await apiClient.get('/integrations/cloudcostiq/status');
      return response.data;
    },
    importFromCloudCostIQ: async (dataType) => {
      const response = await apiClient.post(`/integrations/cloudcostiq/import/${dataType}`);
      return response.data;
    },
    exportToCloudCostIQ: async (dataType, data) => {
      const response = await apiClient.post(`/integrations/cloudcostiq/export/${dataType}`, { data });
      return response.data;
    }
  },
  
  // Users (admin only)
  users: {
    getAll: async () => {
      const response = await apiClient.get('/auth/users');
      return response.data;
    },
    create: async (userData) => {
      const response = await apiClient.post('/auth/create-user', userData);
      return response.data;
    }
  },
  
  // Settings
  settings: {
    get: async () => {
      const response = await apiClient.get('/settings');
      return response.data;
    },
    update: async (settings) => {
      const response = await apiClient.put('/settings', settings);
      return response.data;
    }
  }
};

export default apiService;