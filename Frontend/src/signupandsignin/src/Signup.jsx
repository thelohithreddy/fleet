import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";
import fleetLogo from "../../../public/greylogo.png"; // Import logo
import OTPVerification from "./otpverification";
import useAuthStore from "./../../../store/AuthStore.js";

export default function Signup() {
  const navigate = useNavigate();
  const { setSignupData, sendOtp } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [showOtp, setShowOtp] = useState(false);

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isValidEmail(email)) {
      setError("Invalid Email Format!");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters!");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }
    setShowOtp(true);
    try {
      setSignupData(email, password, confirmPassword);
      const res = await sendOtp();
      if (!res.success) {
        setError(res.message || "Failed to send OTP");
        setShowOtp(false);
      } else {
        setError("");
      }
    } catch (error) {
      console.error("Error sending email:", error);
      setError(error.message || "Failed to send OTP. Please try again.");
      setShowOtp(false); // Revert if an error occurs
    }
  };

  if (showOtp) {
    console.log("Navigating to OTP verification page...");
    return <OTPVerification />;
  }


  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="logo-section">
          <img src={fleetLogo} alt="Fleet Logo" />
        </div>

        <div className="form-section">
          <h2 className="auth-title">Create New Account</h2>

          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="mb-3">
              <label className="form-label">EMAIL</label>
              <input
                type="email"
                className="form-control"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    document.getElementById("password").focus();
                  }
                }}
                id="email"
                autoComplete="email"
              />
            </div>

            <div className="mb-3">
              <label className="form-label">PASSWORD</label>
              <input
                type="password"
                className="form-control"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    document.getElementById("confirmPassword").focus();
                  }
                }}
                id="password"
              />
            </div>

            <div className="mb-3">
              <label className="form-label">CONFIRM PASSWORD</label>
              <input
                type="password"
                className="form-control"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSubmit(e); // Trigger form submission
                  }
                }}
                id="confirmPassword"
              />
            </div>

            <button type="submit" className="btn">Send OTP</button>
          </form>

          <div className="auth-links">
            <span>Already Registered? </span>
            <a href="/auth/signin">Sign in</a>
          </div>
        </div>
      </div>
    </div>
  );
}
