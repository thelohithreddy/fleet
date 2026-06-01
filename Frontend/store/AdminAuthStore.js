import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";
import useAuthStore from "./AuthStore"; // Import AuthStore

// Axios config
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable cookies if needed
});

// Axios interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const { adminlogout } = useAdminAuthStore.getState();

      // Log out the user if token is invalid or expired
      adminlogout();
    }
    return Promise.reject(error);
  }
);

const useAdminAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isVerified: false,
      error: null,

      // Login
      Adminlogin: async (email, password) => {
        try {
          const response = await api.post("/admin/auth/login", { email, password });

          if (response.data.token) {
            // Set token and isAdmin in AuthStore
            const setAuthState = useAuthStore.getState().setAuthState;
            setAuthState(response.data.token, true); // Set isAdmin to true for admin login

            // // Set token and user in AdminAuthStore
            // localStorage.setItem('token', response.data.token);
            // api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;

            set({
              user: response.data.user,
              token: response.data.token,
              error: null,
            });

            return response.data;
          } else {
            throw new Error("Login failed - no token received");
          }
        } catch (error) {
          set({
            user: null,
            token: null,
            error: error.message || "Login failed. Please try again.",
          });
          throw error;
        }
      },

      // Logout
      adminlogout: () => {
        // Clear token and isAdmin in AuthStore
        const setAuthState = useAuthStore.getState().setAuthState;
        setAuthState(null, false); // Clear token and set isAdmin to false

        // Clear token and user in AdminAuthStore
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
        set({
          user: null,
          token: null,
          isVerified: false,
          error: null,
        });

        window.location.href = "/auth/adminsignin"; // Redirect to login page
      },

      // Forgot Password
      forgotPassword: async (email) => {
        const response = await api.post("/admin/auth/forgot-password", { email });
        if (response.data.message) {
          set({ email });
          return response.data;
        } else {
          throw new Error("Failed to send password reset OTP");
        }
      },

      // Reset Password
      resetPassword: async (email, otp, newPassword) => {
        const response = await api.post("/admin/auth/reset-password", { email, otp, newPassword });
        if (response.data.success) {
          return response.data;
        } else {
          throw new Error(response.data.error || "Failed to reset password");
        }
      },
    }),
    {
      name: 'admin-auth-storage',
      getStorage: () => localStorage,
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isVerified: state.isVerified,
      }),
    }
  )
);

export default useAdminAuthStore;