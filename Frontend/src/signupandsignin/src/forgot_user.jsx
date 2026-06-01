import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";
import fleetLogo from "../../../public/greylogo.png"; // Import logo
import OTPVerification from "./otpverification.jsx";
import useAuthStore from "../../../store/AuthStore.js";

export default function Forgot_User() {
  const navigate = useNavigate();
  const { forgotPassword, resetPassword } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [message, setMessage] = useState("");

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

    try {
      const res = await forgotPassword(email);
      setMessage(res.message);
      setError("");
      setShowOtp(true);
    } catch (error) {
      console.error("Error sending OTP:", error.response?.data || error.message);
      setError(error.message || "Failed to send OTP. Please try again.");
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await resetPassword(email, otp, password);
      setMessage(res.message);
      setTimeout(() => {
        navigate("/auth/signin");
      }, 2000);
    } catch (error) {
      setError(error.message || "Failed to reset password. Please try again.");
    }
  };

  if (showOtp) {
    return (
      <div className="auth-container">
        <div className="auth-box">
          <div className="logo-section">
            <img src={fleetLogo} alt="Fleet Logo" />
          </div>

          <div className="form-section">
            <h2 className="auth-title">Enter OTP</h2>

            {message && <div className="alert alert-success">{message}</div>}
            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleOtpSubmit} className="auth-form">
              <div className="mb-3">
                <label className="form-label">OTP</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength="6"
                />
              </div>

              <button type="submit" className="btn">Reset Password</button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="logo-section">
          <img src={fleetLogo} alt="Fleet Logo" />
        </div>

        <div className="form-section">
          <h2 className="auth-title">Reset Password</h2>

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
              />
            </div>

            <div className="mb-3">
              <label className="form-label">NEW PASSWORD</label>
              <input
                type="password"
                className="form-control"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">CONFIRM NEW PASSWORD</label>
              <input
                type="password"
                className="form-control"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="btn">Send OTP</button>
          </form>

          <div className="auth-links">
            <span>Remember your password? </span>
            <a href="/auth/signin">Sign in</a>
          </div>
        </div>
      </div>
    </div>
  );
}
