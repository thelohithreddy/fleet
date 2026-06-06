// BookingStore.js
import { create } from 'zustand';
import api from '../src/config/api.js';
import { getDefaultSearchForm } from '../src/utils/bookingDefaults.js';

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

const emptyVehicleFields = {
  name: '',
  type: '',
  price: '',
  availability: '',
  driverName: '',
  seatingCapacity: '',
  registrationPlate: '',
  vehicleId: '',
  location: '',
};

const useBookingStore = create((set) => ({
  bookingData: {
    ...getDefaultSearchForm(),
    userId: '',
    duration: 0,
    ...emptyVehicleFields,
  },
  error: null,

  setBookingData: (data) => set({ bookingData: data }),

  updateBookingData: (newData) =>
    set((state) => ({
      bookingData: {
        ...state.bookingData,
        ...newData,
      },
    })),

  resetBookingData: () =>
    set({
      bookingData: {
        ...getDefaultSearchForm(),
        userId: '',
        duration: 0,
        ...emptyVehicleFields,
      },
      error: null,
    }),

  confirmBooking: async () => {
    const { bookingData } = useBookingStore.getState();
    try {
      const response = await api.post('/bookings/confirm-booking', bookingData);
      console.log("Booking confirmed:", response.data);
      return true;
    } catch (err) {
      console.error('Error confirming booking:', err);
      set({ error: 'Failed to confirm booking' });
      return false;
    }
  },
}));

export default useBookingStore;
