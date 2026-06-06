import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Vehicle.css";
import useBookingStore from "../../store/BookingStore";
import { calculateVehiclePrice } from "../utils/pricing";

function VehicleCard({ vehicle, bookingType, tripDuration }) {
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);
  const { updateBookingData, bookingData } = useBookingStore();

  const pricing = calculateVehiclePrice(vehicle, {
    pickupDate: bookingData.pickupDate,
    pickupTime: bookingData.pickupTime,
    returnDate: bookingData.returnDate,
    returnTime: bookingData.returnTime,
    duration: tripDuration || bookingData.duration,
  });

  const handleConfirm = async () => {
    setShowPopup(false);
    try {
      updateBookingData({
        ...vehicle,
        vehicleId: vehicle._id,
        pricePerHour: vehicle.pricePerHour,
        duration: pricing.days,
        tripHours: pricing.hours,
        estimatedTotal: pricing.total,
      });

      if (bookingType) {
        navigate("/home/userpickup", { state: { vehicle, bookingType } });
      } else if (!bookingType) {
        navigate("/home/bookingtype", { state: { bookingType } });
      } else {
        navigate("/home/tandc", { state: { bookingType } });
      }
    } catch (error) {
      console.error("Error booking vehicle:", error);
      alert("Failed to book the vehicle. Please try again.");
    }
  };

  const isAvailable = vehicle.availability === "Available";
  const hasHourly = Number(vehicle.pricePerHour) > 0;

  return (
    <article className="vehicle-card_v">
      <div className="vehicle-image_v">
        <img
          src={vehicle.image || "/greylogo.png"}
          alt={vehicle.name}
          loading="lazy"
        />
        <span className="vehicle-badge_v">
          {isAvailable ? "Available" : "Unavailable"}
        </span>
        {vehicle.isHost && (
          <span className="vehicle-badge_v vehicle-badge_v--host">Host</span>
        )}
        {vehicle.rating > 0 && (
          <span className="vehicle-rating_v">★ {vehicle.rating.toFixed(1)}</span>
        )}
      </div>

      <div className="vehicle-details_v">
        <div className="vehicle-header_v">
          <h3>{vehicle.name}</h3>
          <div className="vehicle-price-block_v">
            {hasHourly ? (
              <p className="vehicle-price_v">
                ₹{vehicle.pricePerHour}
                <span>/hr</span>
              </p>
            ) : null}
            <p className="vehicle-price_v vehicle-price_v--day">
              ₹{vehicle.price}
              <span>/day</span>
            </p>
            {pricing.hourlyDiscountPercent > 0 && (
              <span className="vehicle-offer_v">
                {pricing.hourlyDiscountPercent}% off hourly ({pricing.hours}h trip)
              </span>
            )}
            {pricing.promoDiscountPercent > 0 && (
              <span className="vehicle-offer_v">
                WELCOME20 · {pricing.promoDiscountPercent}% promo
              </span>
            )}
          </div>
        </div>

        <div className="vehicle-tags_v">
          <span>{vehicle.type}</span>
          <span>{vehicle.fuelType}</span>
          {vehicle.transmission && <span>{vehicle.transmission}</span>}
          <span>{vehicle.seatingCapacity} seats</span>
          <span>{vehicle.city}</span>
        </div>

        {vehicle.driverName && vehicle.driverName !== "No Driver" && (
          <p className="vehicle-driver_v">Chauffeur: {vehicle.driverName}</p>
        )}
      </div>

      {isAvailable && (
        <button
          type="button"
          className="button_vehicles"
          onClick={() => setShowPopup(true)}
        >
          Book now — ₹{pricing.total} total
          {pricing.totalSavings > 0 && (
            <small className="vehicle-saved_v"> (saved ₹{pricing.totalSavings})</small>
          )}
        </button>
      )}

      {showPopup && (
        <div className="popup-overlay" role="dialog" aria-modal="true">
          <div className="popup-content_v">
            <h3>Confirm booking</h3>
            <div className="popup-price-rows">
              {hasHourly && pricing.hours && (
                <>
                  <div className="popup-price-row">
                    <span>Rate per hour</span>
                    <strong>₹{vehicle.pricePerHour}</strong>
                  </div>
                  <div className="popup-price-row">
                    <span>Trip duration</span>
                    <strong>{pricing.hours} hours</strong>
                  </div>
                  {pricing.hourlyDiscountPercent > 0 && (
                    <div className="popup-price-row popup-price-row--discount">
                      <span>Hourly discount ({pricing.hourlyDiscountPercent}%)</span>
                      <strong>Applied</strong>
                    </div>
                  )}
                </>
              )}
              <div className="popup-price-row">
                <span>Rate per day</span>
                <strong>₹{vehicle.price}</strong>
              </div>
              <div className="popup-price-row">
                <span>Calendar days</span>
                <strong>{pricing.days} {pricing.days === 1 ? "day" : "days"}</strong>
              </div>
              {pricing.promoDiscountAmount > 0 && (
                <div className="popup-price-row popup-price-row--discount">
                  <span>Promo discount</span>
                  <strong>−₹{pricing.promoDiscountAmount}</strong>
                </div>
              )}
              <div className="popup-price-row popup-price-row--total">
                <span>Total</span>
                <strong>₹{pricing.total}</strong>
              </div>
            </div>
            <div className="popup-actions">
              <button type="button" onClick={handleConfirm} className="button_confirm">
                Confirm &amp; continue
              </button>
              <button type="button" onClick={() => setShowPopup(false)} className="button_cancel">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

export default VehicleCard;
