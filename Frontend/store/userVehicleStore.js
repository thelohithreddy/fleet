import { create } from "zustand";
import axios from "axios";

// Configure axios defaults
axios.defaults.baseURL = "/api";
axios.defaults.headers.post["Content-Type"] = "application/json";

// Helper function to normalize vehicle data format
const normalizeVehicle = (vehicle) => ({
  _id: vehicle._id || vehicle.id,
  name: vehicle.name,
  type: vehicle.type,
  price: vehicle.price,
  availability: vehicle.availability,
  rating: vehicle.rating,
  driverName: vehicle.driverName || "",
  driverId: vehicle.driverId || "",
  fuelType: vehicle.fuelType,
  seatingCapacity: vehicle.seatingCapacity,
  registrationPlate: vehicle.registrationPlate,
  vehicleId: vehicle.vehicleId,
  city: vehicle.city,
  image: vehicle.image || "Images/default-car.png",
});

const useUserVehicleStore = create((set, get) => ({
  vehicles: [], // List of vehicles
  error: null, // Error state
  loading: false, // Loading state

  // Function to search vehicles based on search parameters
  searchVehicles: async (searchParams) => {
    set({ loading: true, error: null });
    try {
      console.log("Search parameters:", searchParams);
      const response = await axios.get("/vehicles", { params: searchParams });
      console.log("API response:", response.data);

      if (response.data.success) {
        const normalizedVehicles = response.data.vehicles.map(normalizeVehicle);
        set({ vehicles: normalizedVehicles, loading: false, error: null });
        return normalizedVehicles;
      } else {
        throw new Error(response.data.message || "Failed to fetch vehicles");
      }
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      set({
        vehicles: [],
        loading: false,
        error: error.response?.data?.error || error.message || "An error occurred while fetching vehicles",
      });
      throw error;
    }
  },

  // Function to mark a vehicle as unavailable
  markVehicleUnavailable: async (vehicleId, returnDate, bookingId) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post(`/vehicles/${vehicleId}/unavailable`, {
        returnDate,
        bookingId,
      });

      if (response.status === 200) {
        set({ loading: false });
        return true;
      } else {
        throw new Error(response.data.error || "Failed to mark vehicle as unavailable");
      }
    } catch (error) {
      console.error("Error marking vehicle unavailable:", error);
      set({
        loading: false,
        error: error.response?.data?.error || error.message || "Error marking vehicle unavailable",
      });
      throw error;
    }
  },

  // Function to update a vehicle's status
  updateVehicleStatus: async (vehicleId, status, bookingId) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.put(`/vehicles/${vehicleId}/status`, {
        status,
        bookingId,
      });

      if (response.status === 200) {
        set({ loading: false });
        return true;
      } else {
        throw new Error(response.data.error || "Failed to update vehicle status");
      }
    } catch (error) {
      console.error("Error updating vehicle status:", error);
      set({
        loading: false,
        error: error.response?.data?.error || error.message || "Error updating vehicle status",
      });
      throw error;
    }
  },

  // Function to reset the vehicle store
  resetVehicles: () => {
    set({
      vehicles: [],
      loading: false,
      error: null,
    });
  },
}));

export default useUserVehicleStore;