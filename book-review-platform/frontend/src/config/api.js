// API Configuration for different environments

const API_CONFIG = {
  development: {
    baseURL: 'http://localhost:5000',
    timeout: 10000
  },
  production: {
    baseURL: 'https://bookreviewapp-565z.onrender.com',
    timeout: 15000
  }
};

// Force production API for now since we're using deployed backend
const currentConfig = API_CONFIG.production;

// console.log('🔧 API Configuration:', currentConfig); // Removed for production

export const API_BASE_URL = currentConfig.baseURL;
export const API_TIMEOUT = currentConfig.timeout;

// Helper function to get full API URL
export const getApiUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
};

export default currentConfig;