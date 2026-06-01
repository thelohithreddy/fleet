import React, { useState } from "react";
import "./userpickup.css";
import Logo from "../../public/greylogo.png";
import Map from "./map.jpg";
import { useNavigate, useLocation } from "react-router-dom";
// to interact with the booking store
import useBookingStore from '../../store/BookingStore';

function Userpickup() {
  const location = useLocation();
  const navigate = useNavigate();
  const { bookingType, deliveryOption } = location.state || {};
  const [showPopup, setShowPopup] = useState(false);

  // State to manage pickup location
  const [pickupLocation, setPickupLocation] = useState('');
  
  const updateBookingData = useBookingStore((state) => state.updateBookingData);
  const confirmBooking = useBookingStore((state) => state.confirmBooking); // Zustand action

  const handleConfirmBooking = async () => {
    // Validate input
    // if (!bookingType || !deliveryOption) {
    //   alert("Missing booking information. Please try again.");
    //   return;
    // }

    // Call store's confirmBooking
    const success = await confirmBooking();

    if (success) {
      setShowPopup(true); // Show success popup
    } else {
      alert("Failed to confirm bookingggg. Please try again.");
    }
  };
  const placeholderText =
    (bookingType === "own" && deliveryOption === "Delivery")
      ? "Enter Delivery Address"
      : "Enter Location";

  const handleNext = () => {
    // Update bookingStore on button click
    updateBookingData({ location: pickupLocation });
    console.log("Booking store state after update in userpickup.jsx:", useBookingStore.getState().bookingData);
    handleConfirmBooking(); // Show the booking confirmation popup
  };

  const handlePopupOk = () => {
    setShowPopup(false); // Close the popup
    navigate("/home/active"); // Redirect to the active bookings page
  };

  return (
    <div className="pickup_body">
      <div className="pickup_logo-container">
        <img src={Logo} className="pickup_logo-image" alt="Logo" />
      </div>
      <div className="pickup_location">
        <div className="pickup_location-1">
          <img src={Map} alt="Map Logo" />
          <input
            type="text"
            name="pickup"
            placeholder={placeholderText}
            className="pickup_input-field"
            value={pickupLocation}
            onChange={(e) => setPickupLocation(e.target.value)}
          />
        </div>
        <button onClick={handleNext} className="pickup_next-button">
          Next
        </button>
      </div>

      {/* Popup */}
      {showPopup && (
        <div className="popup-overlay_p">
          <div className="popup-content_p">
            <h3>Booking Confirmed</h3>
            {/* confirmation page for withDrvier OR (own driving + Delivery) */}
            <p className="ppr">Your booking has been successfully confirmed!</p>
            <button onClick={handlePopupOk} className="popup-ok-button">
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Userpickup;