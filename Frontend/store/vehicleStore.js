import { create } from "zustand";
import axios from "axios";

// Configure axios defaults
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  // Check if it's an admin route
  if (config.url.startsWith('/admin')) {
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    }
  } else {
    // For user routes
    const userToken = localStorage.getItem('token');
    if (userToken) {
      config.headers.Authorization = `Bearer ${userToken}`;
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Helper function to normalize vehicle data format
const normalizeVehicle = (vehicle) => {
  return {
    _id: vehicle._id || vehicle.id,
    name: vehicle.name,
    type: vehicle.type,
    price: vehicle.price,
    availability: vehicle.availability,
    rating: vehicle.rating,
    driverName: vehicle.driverName || "No Driveri",
    driverId: vehicle.driverId || "",
    fuelType: vehicle.fuelType,
    seatingCapacity: vehicle.seatingCapacity,
    registrationPlate: vehicle.registrationPlate,
    vehicleId: vehicle.vehicleId,
    city: vehicle.city,
    image: vehicle.image || "Images/default-car.png"
  };
};

const useVehicleStore = create((set, get) => ({
  vehicles: [], // List of vehicles
  error: null, // Error state
  loading: false, // Loading state

  // Fetch all vehicles (admin only)
  fetchVehicles: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get("/admin/vehicles");
      
      if (response.data.success) {
        // Normalize vehicle data
        const normalizedVehicles = response.data.vehicles.map(normalizeVehicle);
        set({ vehicles: normalizedVehicles, error: null });
        return normalizedVehicles;
      } else {
        throw new Error(response.data.error || "Failed to fetch vehicles");
      }
    } catch (error) {
      console.error("Error fetching vehicles:", error.response?.data || error.message);
      set({ 
        vehicles: [],
        error: error.response?.data?.error || "Failed to fetch vehicles" 
      });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // Add a new vehicle (admin only)
  addVehicle: async (vehicleData) => {
    console.log('in store')
    set({ loading: true, error: null });
    try {
      // Ensure required fields are present
      const vehicleToAdd = {
        ...vehicleData,
        availability: vehicleData.availability || "Available",
        rating: vehicleData.rating || 0.0,
        image: vehicleData.image || "Images/default-car.png"
      };

      console.log('Sending vehicle data to server:', vehicleToAdd);

      const response = await api.post("/admin/vehicles", vehicleToAdd);
      
      if (response.data.success) {
        // Normalize the new vehicle data
        const normalizedVehicle = normalizeVehicle(response.data.vehicle);
        console.log('Received normalized vehicle data:', normalizedVehicle);
        // Update the vehicles list with the new vehicle
        set((state) => ({
          vehicles: [...state.vehicles, normalizedVehicle],
          error: null,
        }));
        return normalizedVehicle;
      } else {
        throw new Error(response.data.error || "Failed to add vehicle");
      }
    } catch (error) {
      console.error("Error adding vehicle:", error.response?.data || error.message);
      set({ error: error.response?.data?.error || "Failed to add vehicle" });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // Update an existing vehicle (admin only)
  updateVehicle: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      console.log("Updating vehicle with ID:", id);
      console.log("Update data:", updates);
      
      // Make sure we're using the correct ID format
      const vehicleId = id;
      
      const response = await api.put(`/admin/vehicles/${vehicleId}`, updates);
      
      if (response.data.success) {
        // Normalize the updated vehicle data
        const normalizedVehicle = normalizeVehicle(response.data.vehicle);
        
        set((state) => ({
          vehicles: state.vehicles.map((vehicle) =>
            vehicle._id === vehicleId ? normalizedVehicle : vehicle
          ),
          error: null,
        }));
        return normalizedVehicle;
      } else {
        throw new Error(response.data.error || "Failed to update vehicle");
      }
    } catch (error) {
      console.error("Error updating vehicle:", error.response?.data || error.message);
      set({ error: error.response?.data?.error || "Failed to update vehicle" });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // Remove a vehicle (admin only)
  removeVehicle: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await api.delete(`/admin/vehicles/${id}`);
      
      if (response.data.success) {
        set((state) => ({
          vehicles: state.vehicles.filter((vehicle) => vehicle._id !== id),
          error: null,
        }));
      } else {
        throw new Error(response.data.error || "Failed to remove vehicle");
      }
    } catch (error) {
      console.error("Error removing vehicle:", error.response?.data || error.message);
      set({ error: error.response?.data?.error || "Failed to remove vehicle" });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

}));

export default useVehicleStore;