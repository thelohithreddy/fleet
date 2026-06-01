import React from "react";
import "./userpayment.css";
import logo from "./fulllogo.jpg";
import upi from "./upi.jpg";
import cashondelivery from "./cashondelivery.jpg";
import { NavLink } from 'react-router-dom';

function Userpayment() {
    return (
        <div className="payment_body">
          {/* Left side for logo */}
          <div className="payment_logo-container">
            <img src={logo} alt="Logo" className="payment_logo-image" />
          </div>
    
          {/* Right side for payment options */}
          <div className="payment-options">
            <h2>Payment Options</h2>
            <div className="payment-option">
              <span>UPI</span>
              <img src={upi} alt="UPI"/>
            </div>
            <div className="payment-option">
              <span>Cash on Delivery</span>
              <img src={cashondelivery} alt="Cash on Delivery"/>
            </div>
            <button className="payment_next-button">Next</button>
          </div>
        </div>
      );
  }

export default Userpayment;
