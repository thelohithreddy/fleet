import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";
import fleetLogo from "../../../public/greylogo.png";
import OTPVerification from "./otpverification";
import PasswordInput from "../../components/PasswordInput";
import useAuthStore from "./../../../store/AuthStore.js";

export default function Signup() {
  const navigate = useNavigate();
  const { setSignupData, sendOtp } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      setSignupData(email, password, confirmPassword);
      const res = await sendOtp();
      if (!res.success) {
        setError(res.message || "Failed to send OTP");
      } else {
        setError("");
        setShowOtp(true);
      }
    } catch (error) {
      console.error("Error sending email:", error);
      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to send OTP. Please try again."
      );
      setShowOtp(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showOtp) {
    return <OTPVerification />;
  }


  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="logo-section">
          <img src={fleetLogo} alt="Fleet" />
          <h1 className="brand">Join Fleet</h1>
          <p className="tagline">Create your account and book your first ride in under 2 minutes.</p>
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
                disabled={isSubmitting}
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
              <PasswordInput
                id="password"
                placeholder="Enter password"
                value={password}
                disabled={isSubmitting}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    document.getElementById("confirmPassword").focus();
                  }
                }}
                minLength={6}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">CONFIRM PASSWORD</label>
              <PasswordInput
                id="confirmPassword"
                placeholder="Confirm password"
                value={confirmPassword}
                disabled={isSubmitting}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                minLength={6}
              />
            </div>

            <button type="submit" className="btn" disabled={isSubmitting}>
              {isSubmitting ? "Sending OTP..." : "Send OTP"}
            </button>
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
