import { create } from "zustand";
import api from "../src/config/api.js";

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
  pricePerHour: vehicle.pricePerHour || 0,
  hostAddress: vehicle.hostAddress || "",
  isHost: Boolean(vehicle.isHost || vehicle.hostUserId),
  description: vehicle.description || "",
  transmission: vehicle.transmission || "",
  modelYear: vehicle.modelYear || null,
});

const useUserVehicleStore = create((set, get) => ({
  vehicles: [],
  searchMeta: null,
  error: null,
  loading: false,

  // Function to search vehicles based on search parameters
  searchVehicles: async (searchParams) => {
    set({ loading: true, error: null });
    try {
      console.log("Search parameters:", searchParams);
      const response = await api.get("/vehicles", { params: searchParams });
      console.log("API response:", response.data);

      if (response.data.success) {
        const normalizedVehicles = response.data.vehicles.map(normalizeVehicle);
        set({
          vehicles: normalizedVehicles,
          searchMeta: response.data.meta || null,
          loading: false,
          error: null,
        });
        return normalizedVehicles;
      } else {
        throw new Error(response.data.message || "Failed to fetch vehicles");
      }
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      set({
        vehicles: [],
        searchMeta: null,
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
      const response = await api.post(`/vehicles/${vehicleId}/unavailable`, {
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
      const response = await api.put(`/vehicles/${vehicleId}/status`, {
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
      searchMeta: null,
      loading: false,
      error: null,
    });
  },
}));

export default useUserVehicleStore;
