import React, { useState } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import "./Bookingtype.css";

const Bookingtype = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const bookingType = location.state?.bookingType || 'driver';
  const [deliveryOption, setDeliveryOption] = useState('');

  const handleConfirm = () => {
    if (!deliveryOption) return;
    navigate('/home/tandc', { state: { bookingType, deliveryOption } });
  };

  return (
    <div className="bookingtype_body">
      <div className="bookingtype-container">
        <h2 className="bookingtype">How do you want the car?</h2>
        <p className="bookingtype-subtitle">Choose delivery to your doorstep or pickup from our hub</p>

        <div className="bookingtype_button-group">
          <button
            type="button"
            onClick={() => setDeliveryOption('Delivery')}
            className={`button_bookingtype${deliveryOption === 'Delivery' ? ' selected' : ''}`}
          >
            🚚 Delivery
          </button>
          <button
            type="button"
            onClick={() => setDeliveryOption('Pickup')}
            className={`button_bookingtype${deliveryOption === 'Pickup' ? ' selected' : ''}`}
          >
            📍 Pickup
          </button>
        </div>

        {deliveryOption === 'Delivery' && (
          <div className="bookingtype-info">
            <p>The vehicle will be delivered to the address you provide in the next step.</p>
          </div>
        )}

        {deliveryOption === 'Pickup' && (
          <div className="bookingtype-info">
            <p>Visit our nearest hub to collect your vehicle at the scheduled time.</p>
          </div>
        )}

        <button
          type="button"
          onClick={handleConfirm}
          className="bookingtype_confirm-button"
          disabled={!deliveryOption}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default Bookingtype;
