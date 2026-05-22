import React, { createContext, useState, useEffect, useContext } from 'react';
/* Import your default axios instance instead of individual route files */
import apiClient from '../api/client'; 

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Restore user session data on mount
    const savedUser = sessionStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error("Failed to parse user session storage context.", error);
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('token');
      }
    }
    setLoading(false);

    // 2. Listen for the Axios interceptor's force-logout signal
    const handleForceLogout = () => {
      setUser(null);
    };

    window.addEventListener('auth_session_expired', handleForceLogout);
    
    return () => {
      window.removeEventListener('auth_session_expired', handleForceLogout);
    };
  }, []);

  // 🔄 CONSOLIDATED LOGIN: Handled directly within the context file
  const loginAction = async (email, password) => {
    try {
      // Direct Axios hit using your base config
      const response = await apiClient.post('/auth/login', { email, password });
      
      const { success, token, data } = response.data;

      if (success && token) {
        // Save to sessionStorage right here
        sessionStorage.setItem('token', token);
        sessionStorage.setItem('user', JSON.stringify(data));
        
        // Update the context tracking state
        setUser(data);
      }
      
      // Return the response object to the component so it can handle redirects/messages
      return response.data;
    } catch (error) {
      // Forward the exact error message thrown by your backend controller
      throw error;
    }
  };

  // 🔄 CONSOLIDATED LOGOUT: Cleans everything in one single function call
  const logoutAction = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    setUser(null); 
  };

  const isAdmin = user?.role === 'admin';
  const isAuthenticated = !!user;

  const value = {
    user,
    loading,
    isAuthenticated,
    isAdmin,
    login: loginAction,
    logout: logoutAction
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be executed within an explicit context AuthProvider shell.');
  }
  return context;
}