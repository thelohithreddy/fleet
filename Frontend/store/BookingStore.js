// BookingStore.js
import { create } from 'zustand';
import axios from 'axios';

// Configure axios defaults
axios.defaults.baseURL = 'http://localhost:5000/api';  // Update this to match your backend URL
axios.defaults.headers.post['Content-Type'] = 'application/json';

// Add auth token to requests
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

const useBookingStore = create((set) => ({
  bookingData: {
    // Home.jsx fields:
    city: '',
    pickupDate: '',
    pickupTime: '',
    returnDate: '',
    returnTime: '',
    withDriver: false,
    ownDriving: false,
    // VehicleCard.jsx fields:
    name: '', // name of the vehicle
    type: '',
    price: '',
    availability: '', // will be unavailable from VehicleCard.jsx, Ramith??
    // rating: '', // type??
    driverName: '',
    // driverId: '',
    seatingCapacity: '',
    registrationPlate: '',
    vehicleId: '',
    // from subsequent pages:
    location: '',
    // for each user
    userId: '',
    // duration: 0, // Initialize with default value
    // totalAmount: 0, // Initialize with default value
  },
  error: null,

  setBookingData: (data) => set({ bookingData: data }),

   // function to update just part of the bookingData
   updateBookingData: (newData) =>
   set((state) => ({
     bookingData: {
       ...state.bookingData,
       ...newData,
     },
   })),
   // to reset booking data to initial state
   resetBookingData: () =>
    set({
      bookingData: {
        city: '',
        pickupDate: '',
        pickupTime: '',
        returnDate: '',
        returnTime: '',
        withDriver: false,
        ownDriving: false,
        name: '',
        type: '',
        price: '',
        availability: '',
        // rating: '',
        driverName: '',
        // driverId: '',
        seatingCapacity: '',
        registrationPlate: '',
        vehicleId: '',
        location: '',
        userId: '',
      //   duration: 0, // Initialize with default value
      // totalAmount: 0, // Initialize with default value
      },
      error: null
    }),
  

   //to finalize booking, not used yet
   confirmBooking: async () => {
    const { bookingData } = useBookingStore.getState();
    try {
      //mock API call
      // console.log("Mock API Call - Booking Data:", bookingData);
      // Simulate a small delay like a real API call
      // await new Promise((resolve) => setTimeout(resolve, 1000));
      
      const response = await axios.post('/bookings/confirm-booking', bookingData); // API hit
      
      console.log("Booking not confirmed but data changed:", response.data);
      return true;
    } catch (err) {
      console.error('Error confirming booking:', err);
      set({ error: 'Failed to confirm booking' });
      return false;
    }
  },
}));

export default useBookingStore;






// const useBookingStore = create((set, get) => ({
//   bookingData: {
//     // Home.jsx fields:
//     city: '',
//     pickupDate: '',
//     pickupTime: '',
//     returnDate: '',
//     returnTime: '',
//     withDriver: false,
//     ownDriving: false,
//     // VehicleCard.jsx fields:
//     name: '', // name of the vehicle
//     type: '',
//     price: '',
//     availability: '', // will be unavailable from VehicleCard.jsx
//     rating: '',
//     driverName: '',
//     driverId: '',
//     seatingCapacity: '',
//     registrationPlate: '',
//     vehicleId: ''
//   },
//   error: null,
//   loading: false,

//   setBookingData: (data) => set({ bookingData: data }),

//   // function to update booking data and persist to database
//   updateBookingData: async (newData) => {
//     try {
//       set({ loading: true, error: null });
      
//       // Update local state first
//       const updatedData = {
//         ...get().bookingData,
//         ...newData,
//       };
      
//       set({ bookingData: updatedData });
      
//       console.log("Attempting to save booking data to database:", updatedData);
      
//       // Format the data for the backend
//       const bookingRequest = {
//         city: updatedData.city,
//         pickupDate: updatedData.pickupDate,
//         pickupTime: updatedData.pickupTime,
//         returnDate: updatedData.returnDate,
//         returnTime: updatedData.returnTime,
//         withDriver: updatedData.withDriver,
//         userId: localStorage.getItem('userId') // Add user ID if needed
//       };
      
//       // Save to database using the correct endpoint
//       const response = await axios.post('/bookings/initialize', bookingRequest);
      
//       if (response.data.success) {
//         console.log("Successfully saved booking data to database:", response.data);
//         return true;
//       } else {
//         throw new Error(response.data.error || "Failed to save booking data");
//       }
//     } catch (err) {
//       console.error("Error saving booking data:", err);
//       set({ error: err.message || "Failed to save booking data" });
//       // Don't throw the error - we still want the local state to update
//       return false;
//     } finally {
//       set({ loading: false });
//     }
//   },

//   // Initialize a new booking
//   initializeBooking: async () => {
//     const { bookingData } = get();
//     try {
//       set({ loading: true, error: null });
      
//       // Format dates for backend
//       const formattedData = {
//         ...bookingData,
//         pickupDateTime: new Date(`${bookingData.pickupDate}T${bookingData.pickupTime}`).toISOString(),
//         returnDateTime: new Date(`${bookingData.returnDate}T${bookingData.returnTime}`).toISOString(),
//       };
      
//       console.log("Initializing booking with data:", formattedData);
      
//       const response = await axios.post('/bookings/initialize', formattedData);
      
//       if (response.data.success) {
//         console.log("Successfully initialized booking:", response.data);
//         return true;
//       } else {
//         throw new Error(response.data.error || "Failed to initialize booking");
//       }
//     } catch (err) {
//       console.error("Error initializing booking:", err);
//       set({ error: err.message || "Failed to initialize booking" });
//       return false;
//     } finally {
//       set({ loading: false });
//     }
//   },

//   // Clear booking data
//   clearBookingData: () => {
//     set({
//       bookingData: {
//         city: '',
//         pickupDate: '',
//         pickupTime: '',
//         returnDate: '',
//         returnTime: '',
//         withDriver: false,
//         ownDriving: false,
//         name: '',
//         type: '',
//         price: '',
//         availability: '',
//         rating: '',
//         driverName: '',
//         driverId: '',
//         seatingCapacity: '',
//         registrationPlate: '',
//         vehicleId: ''
//       },
//       error: null,
//       loading: false
//     });
//   }
// }));

// export default useBookingStore;


// import axios from 'axios';       // will be required to send/fectch info to/from backend

// Configure axios defaults
// axios.defaults.baseURL = '/api';
// axios.defaults.headers.post['Content-Type'] = 'application/json';

// const useBookingStore = create((set, get) => ({
//   city: '',
//   pickupDate: '',
//   returnDate: '',
//   bookingType: '',
//   error: null,
//   loading: false,

//   setBookingData: (data) => {
//     const { city, pickupDate, returnDate, bookingType } = data;
//     set({ 
//       city, 
//       pickupDate, 
//       returnDate, 
//       bookingType,
//       error: null 
//     });
//   },
  
//   initializeBooking: async () => {
//     set({ loading: true, error: null });
    
//     try {
//       const state = get();
      
//       // Format dates to match backend expectations
//       const formattedPickupDate = new Date(state.pickupDate).toISOString();
//       const formattedReturnDate = new Date(state.returnDate).toISOString();
      
//       // Prepare the data for the backend
//       const bookingData = {
//         city: state.city,
//         pickupDate: formattedPickupDate,
//         returnDate: formattedReturnDate,
//         withDriver: state.bookingType === 'driver'
//       };
      
//       // Call the backend API
//       const response = await axios.post('/bookings/initialize', bookingData);
      
//       if (response.data.success) {
//         set({ loading: false });
//         return true;
//       } else {
//         throw new Error(response.data.error || 'Failed to initialize booking');
//       }
//     } catch (error) {
//       console.error('Error initializing booking:', error);
      
//       // Extract error message from response if available
//       const errorMessage = error.response?.data?.error || 'Failed to initialize booking';
//       set({ error: errorMessage, loading: false });
//       throw error;
//     }
//   },

//   createBooking: async (vehicleId) => {
//     set({ loading: true, error: null });
    
//     try {
//       const state = get();
      
//       // Format dates to match backend expectations
//       const formattedPickupDate = new Date(state.pickupDate).toISOString();
//       const formattedReturnDate = new Date(state.returnDate).toISOString();
      
//       // Prepare the booking data
//       const bookingData = {
//         vehicleId,
//         city: state.city,
//         pickupDate: formattedPickupDate,
//         returnDate: formattedReturnDate,
//         withDriver: state.bookingType === 'driver'
//       };
      
//       // Create the booking
//       const response = await axios.post('/bookings', bookingData);
      
//       if (response.data.success) {
//         set({ loading: false });
//         return response.data.booking;
//       } else {
//         throw new Error(response.data.error || 'Failed to create booking');
//       }
//     } catch (error) {
//       console.error('Error creating booking:', error);
//       const errorMessage = error.response?.data?.error || 'Failed to create booking';
//       set({ error: errorMessage, loading: false });
//       throw error;
//     }
//   },
  
  // resetBookingData: () => set({
//     city: '',
//     pickupDate: '',
//     returnDate: '',
//     bookingType: '',
//     error: null,
//     loading: false
//   })
// }));

// export default useBookingStore;
