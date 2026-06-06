import React, { useState } from "react";
import "./userpickup.css";
import Map from "./map.jpg";
import { useNavigate, useLocation } from "react-router-dom";
import useBookingStore from '../../store/BookingStore';

function Userpickup() {
  const location = useLocation();
  const navigate = useNavigate();
  const { bookingType, deliveryOption } = location.state || {};
  const [showPopup, setShowPopup] = useState(false);
  const [pickupLocation, setPickupLocation] = useState('');

  const updateBookingData = useBookingStore((state) => state.updateBookingData);
  const confirmBooking = useBookingStore((state) => state.confirmBooking);

  const handleConfirmBooking = async () => {
    const success = await confirmBooking();
    if (success) {
      setShowPopup(true);
    } else {
      alert("Failed to confirm booking. Please try again.");
    }
  };

  const placeholderText =
    (bookingType === "own" && deliveryOption === "Delivery")
      ? "Enter delivery address"
      : "Enter pickup location";

  const handleNext = () => {
    if (!pickupLocation.trim()) {
      alert("Please enter a location");
      return;
    }
    updateBookingData({ location: pickupLocation });
    handleConfirmBooking();
  };

  const handlePopupOk = () => {
    setShowPopup(false);
    navigate("/home/active");
  };

  return (
    <div className="pickup_body">
      <div className="pickup_location">
        <div className="pickup-card">
          <h2>Where should we meet you?</h2>
          <p>
            {deliveryOption === "Delivery"
              ? "Enter the address where you'd like the car delivered."
              : "Enter your preferred pickup location."}
          </p>
          <div className="pickup_location-1">
            <img src={Map} alt="" />
            <input
              type="text"
              name="pickup"
              placeholder={placeholderText}
              className="pickup_input-field"
              value={pickupLocation}
              onChange={(e) => setPickupLocation(e.target.value)}
            />
          </div>
          <button onClick={handleNext} className="pickup_next-button" type="button">
            Confirm booking
          </button>
        </div>
      </div>

      {showPopup && (
        <div className="popup-overlay_p">
          <div className="popup-content_p">
            <h3>Booking confirmed!</h3>
            <p className="ppr">Your ride is booked. View details in My trips.</p>
            <button onClick={handlePopupOk} className="popup-ok-button" type="button">
              View my trips
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Userpickup;
