import { create } from "zustand";
import axios from "axios";
import { jwtDecode } from "jwt-decode"; // To decode the JWT token

// Configure axios defaults
axios.defaults.baseURL = "http://localhost:5000/api";
axios.defaults.headers.post["Content-Type"] = "application/json";

// Add auth token to requests
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const useUserBookingStore = create((set, get) => ({
  activeBookings: [], // List of active bookings
  pastBookings: [], // List of past bookings
  error: null, // Error state
  loading: false, // Loading state

  // Fetch active bookings for a user
  fetchActiveBookings: async () => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("User is not logged in.");

      const decodedToken = jwtDecode(token);
      const userId = decodedToken.userId;

      if (!userId) throw new Error("Invalid token: userId not found.");

      const response = await axios.get(`/bookings/active/${userId}`);
      if (response.data.success) {
        set({ activeBookings: response.data.bookings, error: null });
      } else {
        throw new Error(
          response.data.error || "Failed to fetch active bookings"
        );
      }
    } catch (error) {
      console.error(
        "Error fetching active bookings:",
        error.response?.data || error.message
      );
      set({
        error: error.response?.data?.error || "Failed to fetch active bookings",
      });
    } finally {
      set({ loading: false });
    }
  },

  // Fetch past bookings for a user
  fetchPastBookings: async () => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("User is not logged in.");

      const decodedToken = jwtDecode(token);
      const userId = decodedToken.userId;

      if (!userId) throw new Error("Invalid token: userId not found.");

      const response = await axios.get(`/bookings/past/${userId}`);
      if (response.data.success) {
        set({ pastBookings: response.data.bookings, error: null });
      } else {
        throw new Error(response.data.error || "Failed to fetch past bookings");
      }
    } catch (error) {
      console.error(
        "Error fetching past bookings:",
        error.response?.data || error.message
      );
      set({
        error: error.response?.data?.error || "Failed to fetch past bookings",
      });
    } finally {
      set({ loading: false });
    }
  },

  // Cancel a booking
  cancelBooking: async (bookingId) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.delete(`/bookings/cancel/${bookingId}`);
      if (response.data.success) {
        set((state) => ({
          activeBookings: state.activeBookings.filter(
            (booking) => booking.bookingId !== bookingId
          ),
          error: null,
        }));
  
        // Optionally, log the cancelled booking details for debugging
        console.log("Cancelled booking details:", response.data.booking);
      } else {
        throw new Error(response.data.error || "Failed to cancel booking");
      }
    } catch (error) {
      console.error(
        "Error cancelling booking:",
        error.response?.data || error.message
      );
      set({ error: error.response?.data?.error || "Failed to cancel booking" });
    } finally {
      set({ loading: false });
    }
  },

  // Submit feedback for a booking
  submitFeedback: async (bookingId, rating) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post(`/feedback/submit`, {
        bookingId,
        rating,
      });
      if (response.data.success) {
        set((state) => ({
          pastBookings: state.pastBookings.map((booking) =>
            booking.bookingId === bookingId ? { ...booking, rating } : booking
          ),
          error: null,
        }));
        return true;
      } else {
        throw new Error(response.data.error || "Failed to submit feedback");
      }
    } catch (error) {
      console.error(
        "Error submitting feedback:",
        error.response?.data || error.message
      );
      set({
        error: error.response?.data?.error || "Failed to submit feedback",
      });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  // Reset the store
  resetBookings: () => {
    set({
      activeBookings: [],
      pastBookings: [],
      error: null,
      loading: false,
    });
  },
}));

export default useUserBookingStore;
