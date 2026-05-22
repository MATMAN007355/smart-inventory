import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://inventory-server-1pup.onrender.com/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});

// 1. Request Interceptor (Your original, untouched logic)
apiClient.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 2. Response Interceptor: Wipes storage AND fires a global layout trigger
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      
      // ⚡ FORCE SYNC: Tell the React Context to immediately wipe its state
      window.dispatchEvent(new Event('auth_session_expired'));
    }
    return Promise.reject(error);
  }
);

export default apiClient;