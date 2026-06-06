import { create } from "zustand";
import { persist } from "zustand/middleware";
import { jwtDecode } from "jwt-decode";
import api from "../src/config/api.js";

const AUTH_URLS = /\/auth\/(login|send-otp|verify-otp|resend-otp|forgot-password|reset-password|admin\/auth\/login)/;

// Log out only on 401 for protected API calls — not failed login attempts
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url || "";
      if (AUTH_URLS.test(requestUrl)) {
        return Promise.reject(error);
      }

      const token = localStorage.getItem("token");
      if (!token) {
        return Promise.reject(error);
      }

      let isAdminSession = false;
      try {
        isAdminSession = jwtDecode(token).isAdmin === true;
      } catch {
        isAdminSession = false;
      }

      if (isAdminSession) {
        const { default: useAdminAuthStore } = await import("./AdminAuthStore.js");
        useAdminAuthStore.getState().adminlogout();
      } else {
        useAuthStore.getState().userlogout(false);
      }
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
        set({
          email: email.trim().toLowerCase(),
          password,
          confirmPassword,
        });
      },

      // Send OTP (signup)
      sendOtp: async () => {
        const { email, password, confirmPassword } = get();

        if (!email || !password) throw new Error('Email and password are required');
        if (password !== confirmPassword) throw new Error('Passwords do not match');

        const response = await api.post("/auth/send-otp", { email, password, confirmPassword });
        if (response.data.success) {
          set({ isOtpSent: true });
          return response.data;
          
        } else {
          throw new Error(response.data.message || 'Failed to send OTP');
        }
      },

      // Resend OTP (signup verification — does not re-run signup)
      resendOtp: async () => {
        const { email } = get();
        if (!email) throw new Error('Email is required');

        const response = await api.post("/auth/resend-otp", { email });
        if (response.data.message) {
          set({ isOtpSent: true });
          return response.data;
        }
        throw new Error(response.data.message || 'Failed to resend OTP');
      },

      // Verify OTP
      verifyOtp: async (otp) => {
        try {
          const { email, password } = get();
          const setAuthState = get().setAuthState;
      
          if (!email || !password) throw new Error('Session expired. Please try signing up again.');
      
          const response = await api.post("/auth/verify-otp", {
            email: email.trim().toLowerCase(),
            otp: String(otp).trim(),
            password,
          });
      
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
          const message =
            error.response?.data?.message ||
            error.response?.data?.error ||
            error.message ||
            "OTP verification failed. Please try again.";

          set({
            user: null,
            token: null,
            isVerified: false,
            error: message,
          });

          throw new Error(message);
        }
      },

      // Login
      login: async (email, password) => {
        try {
          const response = await api.post("/auth/login", {
            email: email.trim().toLowerCase(),
            password,
          });
          const setAuthState = get().setAuthState; // Access setAuthState using get()

          if (!response.data.success) {
            return response.data;
          }

          if (response.data.token) {
            setAuthState(response.data.token, false);
            set({
              user: response.data.user,
              error: null,
              isVerified: true,
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

      // Logout (hardRedirect=false avoids full-page flash when already on sign-in)
      userlogout: (hardRedirect = true) => {
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
        set({
          user: null,
          token: null,
          isAdmin: false,
          isOtpSent: false,
          isVerified: false,
          error: null,
        });
        if (hardRedirect && !window.location.pathname.startsWith("/auth/")) {
          window.location.href = "/auth/signin";
        }
      },

      // Forgot Password
      forgotPassword: async (email) => {
        const normalizedEmail = email.trim().toLowerCase();
        const response = await api.post("/auth/forgot-password", {
          email: normalizedEmail,
        });
        if (response.data.success !== false && response.data.message) {
          set({ email: normalizedEmail });
          return response.data;
        }
        throw new Error(
          response.data.message || "Failed to send password reset OTP"
        );
      },

      // Reset Password
      resetPassword: async (email, otp, newPassword) => {
        const response = await api.post("/auth/reset-password", {
          email: email.trim().toLowerCase(),
          otp: otp.toString().trim(),
          newPassword,
        });
        if (response.data.success) {
          return response.data;
        }
        throw new Error(
          response.data.message ||
            response.data.error ||
            "Failed to reset password"
        );
      },
    }),
    {
      name: 'auth-storage',
      getStorage: () => localStorage,
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAdmin: state.isAdmin,
        isVerified: state.isVerified,
        email: state.email,
        password: state.password,
        confirmPassword: state.confirmPassword,
      }),
    }
  )
);

export default useAuthStore;