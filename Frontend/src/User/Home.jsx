import './Home.css';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useEffect } from 'react';
// to get the token and to get the userId from the token
import {jwtDecode} from 'jwt-decode';

// to interact with the booking store

import useBookingStore from '../../store/BookingStore';

function Home() {
  const navigate = useNavigate();

  //below line is wtong because it is calling initializeBooking.
  // const { setBookingData, initializeBooking, error: storeError } = useBookingStore();
  
  // Reset booking data when the component mounts
  // This is to ensure that the booking data is cleared when the user navigates to this page
  // This is done to avoid any stale data from previous bookings
  const resetBookingData = useBookingStore((state) => state.resetBookingData);

  useEffect(() => {
    resetBookingData(); // clears previous data when component mounts
  }, []);

  // Since we only want to save partial data, and not send it to the backend yet, we removed initializeBooking and use updateBookingData instead of setBookingData
  const { updateBookingData, error: storeError } = useBookingStore();
  useEffect(() => {
    const token = localStorage.getItem('token'); // or wherever you're storing it
    if (token) {
      try {
        const decoded = jwtDecode(token);
        console.log("Decoded Token: ", decoded); // 🔍 See what's inside
        const userId = decoded.id || decoded._id || decoded.userId;
        if (userId) {
          updateBookingData({ userId });
        }
      } catch (err) {
        console.error('Invalid token', err);
      }
    }
  }, []);

// Defining state for form data and putting default values
// Default values are set to the next day and the day after tomorrow
  const [formData, setFormData] = useState(() => {
    const now = new Date();
    const nextDay = new Date(now);
    const dayAfterTomorrow = new Date(now);
    nextDay.setDate(now.getDate() + 2); // Next day
    dayAfterTomorrow.setDate(now.getDate() + 3); // Day after tomorrow
  
    return {
      city: 'Kanpur',
      pickupDate: nextDay.toISOString().split('T')[0], // Next day's date in YYYY-MM-DD format
      pickupTime: now.toTimeString().split(' ')[0].slice(0, 5), // Current time in HH:MM format
      returnDate: dayAfterTomorrow.toISOString().split('T')[0], // Day after tomorrow's date in YYYY-MM-DD format
      returnTime: now.toTimeString().split(' ')[0].slice(0, 5), // Same time as pickup time
      withDriver: false,
      ownDriving: true,
    };
  });

  const [formErrors, setFormErrors] = useState({});

  const validateForm = () => {
    const errors = {};
    
    if (!formData.city.trim()) {
      errors.city = 'Please select a city';
    }
    if (!formData.pickupDate) {
      errors.pickupDate = 'Please select pickup date';
    }
    if (!formData.pickupTime) {
      errors.pickupTime = 'Please select pickup time';
    }
    if (!formData.returnDate) {
      errors.returnDate = 'Please select return date';
    }
    if (!formData.returnTime) {
      errors.returnTime = 'Please select return time';
    }
    if (!formData.withDriver && !formData.ownDriving) {
      errors.drivingOption = 'Please select a driving option';
    }

    // Additional date validations
    const pickup = new Date(`${formData.pickupDate}T${formData.pickupTime}`);
    const return_ = new Date(`${formData.returnDate}T${formData.returnTime}`);
    const now = new Date();

    if (pickup < now) {
      errors.pickupDate = 'Pickup date and time must be in the future';
    }
    if (return_ <= pickup) {
      errors.returnDate = 'Return date and time must be after pickup date and time';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    
    if (type === 'radio') {
      setFormData({
        ...formData,
        withDriver: name === 'drive' && value === 'driver',
        ownDriving: name === 'drive' && value === 'own'
      });
      // Clear driving option error when user selects an option
      setFormErrors(prev => ({ ...prev, drivingOption: '' }));
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
      // Clear field-specific error when user makes a change
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSearch = async () => {
    try {
      if (!validateForm()) {
        return; // Stop if validation fails
      }

      // Calculate duration in days
      const pickup = new Date(`${formData.pickupDate}T${formData.pickupTime}`);
      const return_ = new Date(`${formData.returnDate}T${formData.returnTime}`);
      const duration = Math.ceil((return_ - pickup) / (1000 * 60 * 60 * 24));

      // Log the form data before updating the store
      console.log("Form data before updating store:", formData);
      updateBookingData({
        ...formData,
        duration // Add the calculated duration
      }); // Save this step's inputs
      console.log("Booking store state after update in Home.jsx:", useBookingStore.getState().bookingData);
      navigate('/home/vehicles');  // Move to the next step
    } catch (error) {
      console.error("Error during search:", error);
      // Show error to user but don't prevent navigation
      setFormErrors(prev => ({
        ...prev,
        submit: "Error saving booking data. You can still proceed to view vehicles."
      }));
    }
  };
  

  return (
    <div className="body_home">
      <div className="container_home">
        <div className="BLogo_home">
          <img src="/greylogo.png" alt="🚗 FLEET" />
        </div>
        <div className="card_home">
          <div className="form-group">
            <select
              className={`select_home ${formErrors.city ? 'error-input' : ''}`}
              name="city"
              value={formData.city}
              onChange={handleInputChange}
            >
              <option value="">Select City</option>
              <option value="Kanpur">Kanpur</option>
              <option value="Lucknow">Lucknow</option>
              <option value="Delhi">Delhi</option>
            </select>
            {formErrors.city && <div className="error-message">{formErrors.city}</div>}
          </div>

          <div className="Pickup_home">
            <p>Pickup Date</p>
            <p>Pickup Time</p>
          </div>

          <div className="input-group_home">
            <div className="form-group">
              <input
                type="date"
                className={`input_home ${formErrors.pickupDate ? 'error-input' : ''}`}
                name="pickupDate"
                value={formData.pickupDate}
                onChange={handleInputChange}
                min={new Date().toISOString().split('T')[0]}
              />
              {formErrors.pickupDate && <div className="error-message">{formErrors.pickupDate}</div>}
            </div>
            <div className="form-group">
              <input
                type="time"
                className={`input_home ${formErrors.pickupTime ? 'error-input' : ''}`}
                name="pickupTime"
                value={formData.pickupTime}
                onChange={handleInputChange}
              />
              {formErrors.pickupTime && <div className="error-message">{formErrors.pickupTime}</div>}
            </div>
          </div>

          <div className="Return_home">
            <p>Return Date</p>
            <p>Return Time</p>
          </div>

          <div className="input-group_home">
            <div className="form-group">
              <input
                type="date"
                className={`input_home ${formErrors.returnDate ? 'error-input' : ''}`}
                name="returnDate"
                value={formData.returnDate}
                onChange={handleInputChange}
                min={formData.pickupDate || new Date().toISOString().split('T')[0]}
              />
              {formErrors.returnDate && <div className="error-message">{formErrors.returnDate}</div>}
            </div>
            <div className="form-group">
              <input
                type="time"
                className={`input_home ${formErrors.returnTime ? 'error-input' : ''}`}
                name="returnTime"
                value={formData.returnTime}
                onChange={handleInputChange}
              />
              {formErrors.returnTime && <div className="error-message">{formErrors.returnTime}</div>}
            </div>
          </div>

          <div className={`radio-group_home ${formErrors.drivingOption ? 'error-input' : ''}`}>
            <label className="radio-option1_home">
              <input
                type="radio"
                name="drive"
                value="driver"
                checked={formData.withDriver}
                onChange={handleInputChange}
              /> With Driver
            </label>
            <label className="radio-option2_home">
              <input
                type="radio"
                name="drive"
                value="own"
                checked={formData.ownDriving}
                onChange={handleInputChange}
              /> Own Driving
            </label>
            {formErrors.drivingOption && <div className="error-message">{formErrors.drivingOption}</div>}
          </div>

          <button onClick={handleSearch} className="button_home">
            Search Results
          </button>

          {storeError && <div className="error-message store-error">{storeError}</div>}
          {formErrors.submit && <div className="error-message submit-error">{formErrors.submit}</div>}
        </div>
      </div>
    </div>
  );
}

export default Home;