import React, { useState } from "react";
import "./TermsAndConditions.css";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
// to interact with the booking store
import useBookingStore from '../../store/BookingStore';

const TermsAndConditions = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { bookingType, deliveryOption } = location.state || {};
  const [showPopup, setShowPopup] = useState(false); // State to manage popup visibility

  const confirmBooking = useBookingStore((state) => state.confirmBooking); // Zustand action

  const handleConfirmBooking = async () => {
    // Validate input
    if (!bookingType || !deliveryOption) {
      alert("Missing booking information. Please try again.");
      return;
    }

    // Call store's confirmBooking
    const success = await confirmBooking();

    if (success) {
      setShowPopup(true); // Show success popup
    } else {
      alert("Failed to confirm booking. Please tryyyyyy again.");
    }
  };

  const handleAgree = () => {
    // Validate that we have both bookingType and deliveryOption
    if (!bookingType || !deliveryOption) {
      alert("Missing booking information. Please try again.");
      return;
    }

    // Handle different booking scenarios
    //owndrive
    if (bookingType === "own") {
      if (deliveryOption === "Pickup") {
        // console.log("Booking store state after update in owwwwwwwn driving + pickup TermsAndConditions.jsx:", useBookingStore.getState().bookingData);

        // setShowPopup(true); // Show confirmation for self-drive pickup
      } else if (deliveryOption === "Delivery") {
        navigate("/home/userpickup", { 
          state: { 
            bookingType, 
            deliveryOption: "Delivery" 
          } 
        });
      }
    } 
    // withdriver
    else if (bookingType === "driver") {
      if (deliveryOption === "Delivery") {
        navigate("/home/userpickup", { 
          state: { 
            bookingType, 
            deliveryOption: "Delivery" 
          } 
        });
      } else if (deliveryOption === "Pickup") {
        console.log("Booking store state after update in owwwwwwwn driving + pickup TermsAndConditions.jsx:", useBookingStore.getState().bookingData);
        handleConfirmBooking();
        // setShowPopup(true); // Show confirmation for driver pickup
      }
    } else {
      alert("Invalid booking type. Please try again.");
    }
  };

  const handlePopupOk = () => {
    setShowPopup(false); // Close the popup
    navigate("/home/active"); // Redirect to the active bookings page
  };

  return (
    <div className="app-container_tc">
    <div className="body_tc">
      <div className="container_tc">
        <h1 className="h1_tc">Terms and Conditions</h1>
        <section>
          <h2 className="h2_tc">1. User Agreement</h2>
          <p className="p_tc">
            By using the Fleet platform, the customer agrees to abide by all terms and conditions stated here.
          </p>
          <ul className="ul_tc">
            <li className="li_tc">
              The customer must be at least 18 years old (or the legal driving age in their region) to rent a vehicle.
            </li>
            <li>
              A valid government-issued ID and driver's license must be provided for verification.
            </li>
          </ul>
        </section>
        <section>
  <h2 className="h2_tc">2. Rental Policies</h2>
  <ul className="ul_tc">
    <li className="li_tc">
      The vehicle must be returned in the same condition as it was rented, excluding normal wear and tear.
    </li>
    <li className="li_tc">
      Smoking and the consumption of alcohol are strictly prohibited inside the vehicle.
    </li>
    <li className="li_tc">
      The customer is responsible for any traffic violations or fines incurred during the rental period.
    </li>
    <li className="li_tc">
      Fuel charges are not included in the rental price unless explicitly stated.
    </li>
  </ul>
</section>
<section>
  <h2 className="h2_tc">3. Liability</h2>
  <ul className="ul_tc">
    <li className="li_tc">
      The Fleet platform is not responsible for any personal belongings left in the vehicle.
    </li>
    <li className="li_tc">
      The customer is liable for any damage caused to the vehicle during the rental period.
    </li>
    <li className="li_tc">
      Insurance coverage is subject to the terms of the policy provided at the time of booking.
    </li>
  </ul>
</section>

        {/* Other sections remain unchanged */}

        <div className="button-container_tc">
          <button onClick={handleAgree} className="agree-button_tc">
            Agree and Confirm
          </button>
          <NavLink to="/home/vehicles" className="cancel-button_tc">
            Cancel
          </NavLink>
        </div>
      </div>

      {/* Popup */}
      {showPopup && (
        <div className="popup-overlay_p">
          <div className="popup-content_p">
            <h3>Booking Confirmed</h3>
            <p className="ppr">Your booking has been successfully confirmed!</p>
            <button onClick={handlePopupOk} className="popup-ok-button">
              OK
            </button>
          </div>
        </div>
      )}
    </div>
    </div>
  );
};

export default TermsAndConditions;
