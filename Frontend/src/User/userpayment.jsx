import React, { useState } from "react";
import "./userpayment.css";
import upi from "./upi.jpg";
import cashondelivery from "./cashondelivery.jpg";

function Userpayment() {
  const [selected, setSelected] = useState(null);

  return (
    <div className="payment_body">
      <div className="payment-options">
        <h2>Payment</h2>
        <p className="payment-subtitle">Select how you'd like to pay</p>

        <div
          className="payment-option"
          onClick={() => setSelected("upi")}
          style={selected === "upi" ? { borderColor: "var(--fleet-primary)", background: "var(--fleet-primary-light)" } : {}}
          role="button"
          tabIndex={0}
        >
          <span>UPI</span>
          <img src={upi} alt="UPI" />
        </div>

        <div
          className="payment-option"
          onClick={() => setSelected("cod")}
          style={selected === "cod" ? { borderColor: "var(--fleet-primary)", background: "var(--fleet-primary-light)" } : {}}
          role="button"
          tabIndex={0}
        >
          <span>Cash on delivery</span>
          <img src={cashondelivery} alt="Cash on delivery" />
        </div>

        <button className="payment_next-button" type="button" disabled={!selected}>
          Continue
        </button>
      </div>
    </div>
  );
}

export default Userpayment;
