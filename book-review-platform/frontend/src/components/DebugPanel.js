import React, { useState } from 'react';
import { API_BASE_URL } from '../config/api';

const DebugPanel = () => {
  const [testResult, setTestResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testRegistration = async () => {
    setLoading(true);
    setTestResult('Testing...');
    
    const testUser = {
      name: 'Frontend Test User',
      email: `frontendtest${Date.now()}@example.com`,
      password: 'testpass123'
    };

    try {
      console.log('Testing registration with:', testUser);
      
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testUser)
      });

      const data = await response.json();
      
      if (response.ok) {
        setTestResult(`✅ SUCCESS: ${JSON.stringify(data, null, 2)}`);
      } else {
        setTestResult(`❌ FAILED: ${response.status} - ${JSON.stringify(data, null, 2)}`);
      }
    } catch (error) {
      setTestResult(`❌ ERROR: ${error.message}`);
      console.error('Test error:', error);
    } finally {
      setLoading(false);
    }
  };

  const testBackend = async () => {
    setLoading(true);
    setTestResult('Testing backend...');
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/books`);
      const data = await response.json();
      
      if (response.ok) {
        setTestResult(`✅ Backend OK: Found ${data.books?.length || 0} books`);
      } else {
        setTestResult(`❌ Backend Error: ${response.status}`);
      }
    } catch (error) {
      setTestResult(`❌ Backend Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border max-w-md">
      <h3 className="font-bold mb-2">Debug Panel</h3>
      <div className="space-y-2">
        <button 
          onClick={testBackend}
          disabled={loading}
          className="btn-secondary w-full text-sm"
        >
          Test Backend Connection
        </button>
        <button 
          onClick={testRegistration}
          disabled={loading}
          className="btn-primary w-full text-sm"
        >
          Test Registration API
        </button>
      </div>
      {testResult && (
        <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded text-xs overflow-auto max-h-32">
          <pre>{testResult}</pre>
        </div>
      )}
      <div className="mt-2 text-xs text-gray-500">
        API: {API_BASE_URL}
      </div>
    </div>
  );
};

export default DebugPanel;