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
  const adminToken = localStorage.getItem('adminToken');
  if (adminToken) {
    config.headers.Authorization = `Bearer ${adminToken}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Helper function to normalize driver data format
const normalizeDriver = (driver) => {
  return {
    _id: driver._id || driver.id,
    name: driver.name,
    age: driver.age,
    phone: driver.phone,
    license: driver.license,
    vehicleId: driver.vehicleId || "",
    driverId: driver.driverId,
    address: driver.address,
    image: driver.image || "Images/default-driver.png"
  };
};

const useDriverStore = create((set, get) => ({
  drivers: [], // List of drivers
  error: null, // Error state
  loading: false, // Loading state

  // Fetch all drivers
  fetchDrivers: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get("/admin/drivers");
      
      if (response.data.success) {
        // Normalize driver data
        const normalizedDrivers = response.data.drivers.map(normalizeDriver);
        set({ drivers: normalizedDrivers, error: null });
        return normalizedDrivers;
      } else {
        throw new Error(response.data.error || "Failed to fetch drivers");
      }
    } catch (error) {
      console.error("Error fetching drivers:", error.response?.data || error.message);
      set({ 
        drivers: [],
        error: error.response?.data?.error || "Failed to fetch drivers" 
      });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // Add a new driver
  addDriver: async (driverData) => {
    set({ loading: true, error: null });
    try {
      // Ensure required fields are present
      const driverToAdd = {
        ...driverData,
        image: driverData.image || "Images/default-driver.png"
      };

      console.log('Sending driver data to server:', driverToAdd);

      const response = await api.post("/admin/drivers", driverToAdd);
      
      if (response.data.success) {
        // Normalize the new driver data
        const normalizedDriver = normalizeDriver(response.data.driver);
        
        // Update the drivers list with the new driver
        set((state) => ({
          drivers: [...state.drivers, normalizedDriver],
          error: null,
        }));
        return normalizedDriver;
      } else {
        throw new Error(response.data.error || "Failed to add driver");
      }
    } catch (error) {
      console.error("Error adding driver:", error.response?.data || error.message);
      set({ error: error.response?.data?.error || "Failed to add driver" });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // Update an existing driver
  updateDriver: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      console.log("Updating driver with ID:", id);
      console.log("Update data:", updates);
      
      const response = await api.put(`/admin/drivers/${id}`, updates);
      
      if (response.data.success) {
        // Normalize the updated driver data
        const normalizedDriver = normalizeDriver(response.data.driver);
        
        set((state) => ({
          drivers: state.drivers.map((driver) =>
            driver._id === id ? normalizedDriver : driver
          ),
          error: null,
        }));
        return normalizedDriver;
      } else {
        throw new Error(response.data.error || "Failed to update driver");
      }
    } catch (error) {
      console.error("Error updating driver:", error.response?.data || error.message);
      set({ error: error.response?.data?.error || "Failed to update driver" });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // Remove a driver
  removeDriver: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await api.delete(`/admin/drivers/${id}`);
      
      if (response.data.success) {
        set((state) => ({
          drivers: state.drivers.filter((driver) => driver._id !== id),
          error: null,
        }));
        return true;
      } else {
        throw new Error(response.data.error || "Failed to remove driver");
      }
    } catch (error) {
      console.error("Error removing driver:", error.response?.data || error.message);
      set({ error: error.response?.data?.error || "Failed to remove driver" });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // Get driver profile
  getDriverProfile: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get("/admin/drivers/profile");
      
      if (response.data.success) {
        const normalizedDriver = normalizeDriver(response.data.driver);
        return normalizedDriver;
      } else {
        throw new Error(response.data.error || "Failed to fetch driver profile");
      }
    } catch (error) {
      console.error("Error fetching driver profile:", error.response?.data || error.message);
      set({ error: error.response?.data?.error || "Failed to fetch driver profile" });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // Update driver profile
  updateDriverProfile: async (profileData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.put("/admin/drivers/profile", profileData);
      
      if (response.data.success) {
        const normalizedDriver = normalizeDriver(response.data.driver);
        
        set((state) => ({
          drivers: state.drivers.map((driver) =>
            driver._id === normalizedDriver._id ? normalizedDriver : driver
          ),
          error: null,
        }));
        return normalizedDriver;
      } else {
        throw new Error(response.data.error || "Failed to update driver profile");
      }
    } catch (error) {
      console.error("Error updating driver profile:", error.response?.data || error.message);
      set({ error: error.response?.data?.error || "Failed to update driver profile" });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));

export default useDriverStore;