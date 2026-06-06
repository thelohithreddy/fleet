import React, { useState } from "react";
import "./Active.css";
import useUserBookingStore from "../../store/userActivePast";

function BookingCard1({ booking }) {
  const [showPopup, setShowPopup] = useState(false);
  const { cancelBooking } = useUserBookingStore();

  const handleCancel = async () => {
    if (!window.confirm("Cancel this booking?")) return;
    try {
      await cancelBooking(booking.bookingId);
      setShowPopup(true);
    } catch (error) {
      console.error("Error cancelling booking:", error);
    }
  };

  return (
    <div className="booking-card_active">
      <div className="booking-card_active__header">
        <h3 className="booking-card_active__title">{booking.vehicleName}</h3>
        <span className="fleet-badge fleet-badge--active">Active</span>
      </div>

      <div className="details_active">
        <div className="left_active">
          <p><strong>Pickup</strong> {booking.startDate}</p>
          <p><strong>Return</strong> {booking.endDate}</p>
          <p><strong>Duration</strong> {booking.duration} day{booking.duration !== 1 ? "s" : ""}</p>
          {booking.driverName && <p><strong>Driver</strong> {booking.driverName}</p>}
          {booking.address && <p><strong>Location</strong> {booking.address}</p>}
          <p><strong>Total</strong> ₹{booking.price}</p>
        </div>
        <div className="right_active">
          <img src={booking.image} alt={booking.vehicleName} className="vehicle-image" />
        </div>
      </div>

      <div className="cancel_active">
        <button onClick={handleCancel} className="cancel-btn" type="button">
          Cancel booking
        </button>
      </div>

      {showPopup && (
        <div className="popup-overlay_c">
          <div className="popup-content_c">
            <h3>Ride cancelled</h3>
            <p>Your booking has been successfully cancelled.</p>
            <button onClick={() => setShowPopup(false)} className="popup-close-btn" type="button">
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default BookingCard1;
