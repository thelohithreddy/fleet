import React, { useState } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import "./Bookingtype.css";

const Bookingtype = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const bookingType = location.state?.bookingType || 'driver';
  const [deliveryOption, setDeliveryOption] = useState('');

  const handleDelivery = () => {
    setDeliveryOption('Delivery');
  };

  const handlePickup = () => {
    setDeliveryOption('Pickup');
  };

  const handleConfirm = () => {
    navigate('/home/tandc', { state: { bookingType, deliveryOption } });
  };

  return (
    <div className="bookingtype_body">
    <div className="bookingtype-container">
      <h2 className="bookingtype">Booking Type</h2>
      
      <div className="bookingtype_button-group">
        <button onClick={handleDelivery} className="button_bookingtype">
          Delivery
        </button>
        <button onClick={handlePickup} className="button_bookingtype">
          Pickup
        </button>
      </div>
      
      {deliveryOption === 'Delivery' && (
              <div >
                {/* Add any additional UI elements for "With Driver" option here */}
                <p>"You have selected Delivery. The vehicle will be dropped off at the address you will provide"</p>
              </div>
            )}

            {deliveryOption === 'Pickup' && (
              <div >
                {/* Add any additional UI elements for "Own Driving" option here */}
                <p >"You have selected Pickup. Please visit our store to collect your vehicle."</p>
              </div>
            )}
      <button onClick={handleConfirm} className="bookingtype_confirm-button">
        Confirm
      </button>
    </div>
    </div>
  );
};

export default Bookingtype;