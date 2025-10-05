// Test connection to deployed backend
import { getApiUrl } from '../config/api';

export const testBackendConnection = async () => {
  try {
    const response = await fetch(getApiUrl('/api/books'), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Backend connection successful!');
      console.log('📚 Books found:', data.books?.length || 0);
      return { success: true, data };
    } else {
      console.log('❌ Backend responded with error:', response.status);
      return { success: false, error: response.status };
    }
  } catch (error) {
    console.log('❌ Connection failed:', error.message);
    return { success: false, error: error.message };
  }
};

// Test authentication endpoint
export const testAuthEndpoint = async () => {
  try {
    const response = await fetch(getApiUrl('/api/auth/test'), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('🔐 Auth endpoint status:', response.status);
    return response.status;
  } catch (error) {
    console.log('❌ Auth test failed:', error.message);
    return false;
  }
};