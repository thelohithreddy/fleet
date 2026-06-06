import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../../store/AuthStore"; // Import your user auth store
import './Auth.css';
import fleetLogo from '../../../public/greylogo.png';
import PasswordInput from '../../components/PasswordInput';

export default function UserSignin() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login); // Zustand login function for users
  const errorFromStore = useAuthStore((state) => state.error); // Zustand error state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Email validation function
  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Form submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate email format
    if (!isValidEmail(email)) {
      setError("Invalid Email Format!");
      return;
    }
    // Optionally validate password length if needed
    // if (password.length < 6) {
    //   setError("Password must be at least 6 characters!");
    //   return;
    // }

    try {
      setError("");
      setIsLoading(true);
      const response = await login(email, password);

      if (response.success) {
        navigate("/home", { replace: true });
      } else {
        setError(response.message);
      }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        errorFromStore ||
        "Login failed. Please try again.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    // Navigate to the forgot password page with state if needed
    navigate("/auth/forgotpassword_user", { state: { isForgotPassword: true } });
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="logo-section">
          <img src={fleetLogo} alt="Fleet" />
          <h1 className="brand">Drive anywhere.<br />Book in minutes.</h1>
          <p className="tagline">Self-drive and chauffeur cars — transparent pricing, instant booking.</p>
          <div className="auth-hero-badges">
            <span>✓ Verified cars</span>
            <span>✓ Flexible plans</span>
            <span>✓ 24/7 support</span>
          </div>
        </div>

        <div className="form-section">
          <h2 className="auth-title">Sign In</h2>

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
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">PASSWORD</label>
              <PasswordInput
                id="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                autoComplete="current-password"
                required
              />
              <div className="forgot-password">
                <a href="#" onClick={handleForgotPassword}>Forgot Password?</a>
              </div>
            </div>

            <button type="submit" className="btn" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="auth-links">
            <span>New here? </span>
            <a href="/auth/signup">Create an account</a>
          </div>

          <div className="auth-links">
            <span>Admin? </span>
            <a href="/auth/adminsignin">Sign in as admin</a>
          </div>
        </div>
      </div>
    </div>
  );
}

