import React, { useState } from "react";
import "./Active.css";
import useUserBookingStore from "../../store/userActivePast";

function BookingCard1({ booking }) {
  const [showPopup, setShowPopup] = useState(false);
  const { cancelBooking } = useUserBookingStore();

  const handleCancel = async () => {
    try {
      await cancelBooking(booking.bookingId);
      setShowPopup(true);
    } catch (error) {
      console.error("Error cancelling booking:", error);
    }
  };

  const handlePopupClose = () => {
    setShowPopup(false);
  };

  return (
    <div className="booking-card_active">
      <div className="details_active">
        <div className="left_active">
          <h3>{booking.vehicleName}</h3>
          <p>Start Date & Time: {booking.startDate}</p>
          <p>End Date & Time: {booking.endDate}</p>
          <p>Duration: {booking.duration} days</p>
          <p>Driver Name: {booking.driverName}</p>
          <p>Vehicle ID: {booking.vehicleId}</p>
          {booking.address && <p>Address: {booking.address}</p>}
          <p>Total Price: {booking.price}</p>
        </div>
        <div className="right_active">
          <img src={booking.image} alt={booking.vehicleName} className="vehicle-image" />
        </div>
      </div>
      <div className="cancel_active">
       
        {showPopup && (
          <div className="popup-overlay_c">
            <div className="popup-content_c">
              <h3>Ride Cancelled</h3>
              <p>Your ride has been successfully cancelled.</p>
              <button onClick={handlePopupClose} className="popup-close-btn">
                OK
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default BookingCard1;