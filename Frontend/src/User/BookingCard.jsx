import React, { useState } from "react";
import "./Past.css";
import useUserBookingStore from "../../store/userActivePast";

function BookingCard({ booking }) {
  const { submitFeedback } = useUserBookingStore();
  const [showPopup, setShowPopup] = useState(false);
  const [rating, setRating] = useState(booking.rating || 0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleOpenPopup = () => {
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setRating(booking.rating || 0);
    setError(null);
  };

  const handleStarClick = (index) => {
    setRating(index + 1);
  };

  const handleSubmitRating = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const success = await submitFeedback(booking.bookingId, rating);
      if (success) {
        alert("Rating submitted successfully!");
        setShowPopup(false);
      } else {
        setError("Failed to submit rating. Please try again.");
      }
    } catch (err) {
      console.error("Error submitting rating:", err);
      setError("An error occurred while submitting the rating.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="booking-card_past">
      <div className="details_past">
        <div className="left_past">
          <h3>{booking.vehicleName}</h3>
          <p>Start Date & Time: {booking.startDate}</p>
          <p>End Date & Time: {booking.endDate}</p>
          <p>Duration: {booking.duration} days</p>
          {/* <p>
            Rating: {booking.rating ? "⭐".repeat(booking.rating) : "Not rated yet"}
          </p> */}
        </div>
        <div className="right_past">
          <img src={booking.image} alt={booking.vehicleName} className="vehicle-image" />
        </div>
      </div>
      {/* <div className="rating_past">
        <button className="rating-btn_past" onClick={handleOpenPopup}>
          {booking.rating ? "Update Rating" : "Submit Rating"} 
        </button>
      </div> */}
      {showPopup && (
        <div className="popup_r">
          <div className="popup-content">
            <h3>Rate {booking.vehicleName}</h3>
            <div className="star-rating">
              {[...Array(5)].map((_, index) => (
                <span
                  key={index}
                  className={`star ${index < rating ? "filled" : ""}`}
                  onClick={() => handleStarClick(index)}
                >
                  &#9733;
                </span>
              ))}
            </div>
            {error && <p className="error-message">{error}</p>}
            <div className="popup-buttons">
              <button onClick={handleSubmitRating} disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>
              <button onClick={handleClosePopup}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BookingCard;