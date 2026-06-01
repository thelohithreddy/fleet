import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";

// Axios config
const api = axios.create({
  baseURL: '/api/auth',
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
      const { userlogout } = useAuthStore.getState();

      // Log out the user if token is invalid or expired
      userlogout();
    }
    return Promise.reject(error);
  }
);

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAdmin: false,
      isOtpSent: false,
      isVerified: false,
      error: null,

      // Set token and isAdmin state
      setAuthState: (token, isAdmin) => {
        set({
          token,
          isAdmin,
        });

        // Save the token in localStorage and set it in Axios headers
        if (token) {
          localStorage.setItem('token', token);
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
          localStorage.removeItem('token');
          delete api.defaults.headers.common['Authorization'];
        }
      },

      // Set signup data
      setSignupData: (email, password, confirmPassword) => {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        set({ email, password, confirmPassword });
      },

      // Send OTP
      sendOtp: async () => {
        const { email, password, confirmPassword } = get();

        if (!email || !password) throw new Error('Email and password are required');
        if (password !== confirmPassword) throw new Error('Passwords do not match');

        const response = await api.post("/send-otp", { email, password, confirmPassword });
        if (response.data.success) {
          set({ isOtpSent: true });
          return response.data;
          
        } else {
          throw new Error(response.data.message || 'Failed to send OTP');
        }
      },

      // Verify OTP
      verifyOtp: async (otp) => {
        try {
          const { email, password } = get();
          const setAuthState = get().setAuthState;
      
          if (!email || !password) throw new Error('Session expired. Please try signing up again.');
      
          const response = await api.post("/verify-otp", { email, otp, password });
      
          if (!response.data.success) {
            return response.data;
          }
      
          if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      
            set({
              user: response.data.user,
              isVerified: true,
              error: null,
            });
      
            setAuthState(response.data.token, false); // Set token and isAdmin in Zustand store
            return response.data;
          } else {
            throw new Error("OTP verification failed - no token received");
          }
        } catch (error) {
          set({
            user: null,
            token: null,
            isVerified: false,
            error: error.message || "OTP verification failed. Please try again.",
          });
      
          // Removed the invalid setAuthState call here
          throw error; // Re-throw the error to handle it in the calling function
        }
      },

      // Login
      login: async (email, password) => {
        try {
          const response = await api.post("/login", { email, password });
          const setAuthState = get().setAuthState; // Access setAuthState using get()

          if (!response.data.success) {
            return response.data;
          }

          if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;

            set({
              user: response.data.user,
              error: null,
            });

            setAuthState(response.data.token, false); // Set token and isAdmin in Zustand store
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
      userlogout: () => {
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
        set({
          user: null,
          token: null,
          isOtpSent: false,
          isVerified: false,
          error: null,
        });
        window.location.href = "/auth/signin"; // Redirect to login page
      },

      // Forgot Password
      forgotPassword: async (email) => {
        const response = await api.post("/forgot-password", { email });
        if (response.data.message) {
          set({ email });
          return response.data;
        } else {
          throw new Error("Failed to send password reset OTP");
        }
      },

      // Reset Password
      resetPassword: async (email, otp, newPassword) => {
        const response = await api.post("/reset-password", { email, otp, newPassword });
        if (response.data.success) {
          return response.data;
        } else {
          throw new Error(response.data.error || "Failed to reset password");
        }
      },
    }),
    {
      name: 'auth-storage',
      getStorage: () => localStorage,
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isVerified: state.isVerified,
      }),
    }
  )
);

export default useAuthStore;