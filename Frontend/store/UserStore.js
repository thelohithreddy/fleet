import { create } from 'zustand';
import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: '/api/users',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Add response interceptor for better error handling
api.interceptors.response.use((response) => {
  return response;
}, (error) => {
  console.error('API Error:', error.response?.data || error.message);
  return Promise.reject(error);
});

const useUserStore = create((set) => ({
  // User state
  user: null,
  loading: false,
  error: null,

  // Get user profile
  getUserProfile: async () => {
    try {
      set({ loading: true, error: null });
      const response = await api.get('/profile');
      
      if (response.data.success) {
        set({ 
          user: response.data.user,
          loading: false 
        });
        return response.data.user;
      } else {
        throw new Error(response.data.message || 'Failed to fetch user profile');
      }
    } catch (error) {
      set({ 
        error: error.response?.data?.error || error.message || 'Failed to fetch user profile',
        loading: false 
      });
      throw error;
    }
  },

  // Update user profile
  updateUserProfile: async (userData) => {
    try {
      set({ loading: true, error: null });
      const response = await api.put('/profile', userData);
      
      if (response.data.success) {
        set({ 
          user: response.data.user,
          loading: false 
        });
        return response.data.user;
      } else {
        throw new Error(response.data.message || 'Failed to update profile');
      }
    } catch (error) {
      set({ 
        error: error.response?.data?.error || error.message || 'Failed to update profile',
        loading: false 
      });
      throw error;
    }
  },

  // Get help information
  getHelpInfo: async () => {
    try {
      set({ loading: true, error: null });
      const response = await api.get('/help');
      
      if (response.data.success) {
        set({ loading: false });
        return response.data.helpInfo;
      } else {
        throw new Error(response.data.message || 'Failed to fetch help information');
      }
    } catch (error) {
      set({ 
        error: error.response?.data?.error || error.message || 'Failed to fetch help information',
        loading: false 
      });
      throw error;
    }
  },

  // Logout user
  logout: async () => {
    try {
      set({ loading: true, error: null });
      const response = await api.post('/logout');
      
      if (response.data.success) {
        // Clear user data and token
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        set({ 
          user: null,
          loading: false 
        });
        return true;
      } else {
        throw new Error(response.data.message || 'Failed to logout');
      }
    } catch (error) {
      set({ 
        error: error.response?.data?.error || error.message || 'Failed to logout',
        loading: false 
      });
      throw error;
    }
  },

  // Reset error state
  clearError: () => set({ error: null }),

  // Reset user state
  resetUser: () => set({ user: null, error: null })
}));

export default useUserStore; 