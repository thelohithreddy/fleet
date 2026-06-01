import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";
import fleetLogo from "../../../public/greylogo.png"; // Import logo
import useAuthStore from "../../../store/AuthStore.js";

export default function OTPVerification() {
  const navigate = useNavigate();
  const { email, sendOtp, verifyOtp } = useAuthStore();

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(45);
  const [resendEnabled, setResendEnabled] = useState(false);
  const [message, setMessage] = useState("");

  // useEffect(() => {
  //   sendOtp(); // Send OTP on mount
  // }, []);

  // Timer Countdown
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setResendEnabled(true);
    }
  }, [timer]);

  // Handle OTP Input Change
  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < otp.length - 1) {
      document.getElementById(`otp-${index + 1}`).focus();
    } else if (!value && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus();
    }
  };

  // Handle Backspace Key
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const newOtp = [...otp];
      newOtp[index - 1] = "";
      setOtp(newOtp);
      document.getElementById(`otp-${index - 1}`).focus();
    }
  };

  // Verify OTP Function
  const handleVerifyOtp = async () => {
    try {
      const enteredOtp = otp.join("");
      if (!enteredOtp || enteredOtp.length !== 6) {
        setMessage("Please enter a valid 6-digit OTP");
        return;
      }
      const res = await verifyOtp(enteredOtp);
      if (res.success) {
        setMessage("OTP Verified Successfully!");
        setTimeout(() => navigate("/auth/signin"), 1000);
      } else {
        setMessage(res.message || "OTP verification failed");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      setMessage(error.message || "Invalid OTP. Please try again.");
    }
  };

  // Resend OTP Function
  const handleResendOtp = async () => {
    try {
      await sendOtp();
      setTimer(45);
      setResendEnabled(false);
    } catch (error) {
      console.error(error);
      setMessage("Failed to resend OTP. Please try again.");
    }
  };
  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="logo-section">
          <img src={fleetLogo} alt="Fleet Logo" />
        </div>

        <div className="form-section">
          <h2 className="auth-title">Verify Your Email</h2>
          <p className="text-center mb-4">
            Enter the 6-digit code sent to<br />
            <strong>{email}</strong>
          </p>

          {message && (
            <div
              className={`alert ${
                message.includes("Successfully") ? "alert-success" : "alert-danger"
              }`}
            >
              {message}
            </div>
          )}

          <div className="otp-inputs">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                inputMode="numeric"
                maxLength="1"
                className="otp-input"
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                autoComplete="off"
              />
            ))}
          </div>

          <button className="otp-verify-btn" onClick={handleVerifyOtp}>
            Verify OTP
          </button>

          <div className="auth-links">
            {!resendEnabled ? (
              <p className="timer-text">Resend OTP in {timer} seconds</p>
            ) : (
              <button className="resend-otp-btn" onClick={handleResendOtp}>
                Resend OTP
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
