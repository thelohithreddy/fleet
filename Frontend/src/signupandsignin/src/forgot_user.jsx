import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";
import fleetLogo from "../../../public/greylogo.png";
import useAuthStore from "../../../store/AuthStore.js";
import PasswordInput from "../../components/PasswordInput";

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
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!isValidEmail(email)) {
      setError("Invalid email format.");
      return;
    }
    if (isLoading) return;

    try {
      setIsLoading(true);
      const res = await forgotPassword(email.trim().toLowerCase());
      setMessage(res.message || "OTP sent to your email.");
      setShowOtp(true);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Failed to send OTP. Please try again.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (isLoading || isComplete) return;

    setError("");
    setMessage("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password === email.trim().toLowerCase()) {
      setError("Password cannot be the same as your email.");
      return;
    }
    if (!/^\d{6}$/.test(otp.trim())) {
      setError("Enter the 6-digit OTP from your email.");
      return;
    }

    try {
      setIsLoading(true);
      const res = await resetPassword(
        email.trim().toLowerCase(),
        otp.trim(),
        password
      );
      setIsComplete(true);
      setMessage(res.message || "Password reset successful!");
      setTimeout(() => navigate("/auth/signin", { replace: true }), 2000);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Failed to reset password. Please try again.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  if (showOtp) {
    return (
      <div className="auth-container">
        <div className="auth-box">
          <div className="logo-section">
            <img src={fleetLogo} alt="Fleet" />
            <h1 className="brand">Reset password</h1>
            <p className="tagline">Enter the code we sent and choose a new password.</p>
          </div>

          <div className="form-section">
            <h2 className="auth-title">Reset Password</h2>
            <p className="text-center mb-3">
              OTP sent to <strong>{email}</strong>
            </p>

            {message && <div className="alert alert-success">{message}</div>}
            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleOtpSubmit} className="auth-form">
              <div className="mb-3">
                <label className="form-label">OTP (6 digits)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter OTP from email"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  maxLength="6"
                  inputMode="numeric"
                  disabled={isLoading || isComplete}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">NEW PASSWORD</label>
                <PasswordInput
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  disabled={isLoading || isComplete}
                  required
                  autoComplete="new-password"
                />
              </div>

              <div className="mb-3">
                <label className="form-label">CONFIRM NEW PASSWORD</label>
                <PasswordInput
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  minLength={6}
                  disabled={isLoading || isComplete}
                  required
                  autoComplete="new-password"
                />
              </div>

              <button type="submit" className="btn" disabled={isLoading || isComplete}>
                {isComplete ? "Done" : isLoading ? "Resetting..." : "Reset Password"}
              </button>
            </form>

            <div className="auth-links">
              <button
                type="button"
                className="resend-otp-btn"
                style={{ background: "none", border: "none", cursor: "pointer" }}
                onClick={() => {
                  setShowOtp(false);
                  setOtp("");
                  setPassword("");
                  setConfirmPassword("");
                }}
              >
                Use a different email
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="logo-section">
          <img src={fleetLogo} alt="Fleet" />
          <h1 className="brand">Forgot password?</h1>
          <p className="tagline">No worries — we'll send a verification code to your email.</p>
        </div>

        <div className="form-section">
          <h2 className="auth-title">Forgot Password</h2>
          <p className="text-center mb-3 text-muted">
            Enter your registered email. We will send a 6-digit OTP.
          </p>

          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSendOtp} className="auth-form">
            <div className="mb-3">
              <label className="form-label">EMAIL</label>
              <input
                type="email"
                className="form-control"
                placeholder="Enter your registered email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn" disabled={isLoading}>
              {isLoading ? "Sending..." : "Send OTP"}
            </button>
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
