import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../../store/AuthStore"; // Import your user auth store
import './Auth.css';
import fleetLogo from '../../../public/greylogo.png'; // Import logo

export default function UserSignin() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login); // Zustand login function for users
  const errorFromStore = useAuthStore((state) => state.error); // Zustand error state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

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
      setError(""); // Clear any local error
      const response = await login(email, password);
      
      // Check if response contains a valid user and token
      if (response.success) {
        console.log("Login successful:", response);
        // Use push navigation (do NOT use replace) so that the sign in page remains in history.
        navigate("/home/");
      } else {
        setError(response.message);
      }
    } catch (err) {
      console.error("Login failed:", err);
      setError(err.message || errorFromStore || "Login failed. Please try again.");
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
          <img src={fleetLogo} alt="Fleet Logo" />
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
              <input
                type="password"
                className="form-control"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSubmit(e); // Trigger form submission on Enter
                  }
                }}
                id="password"
                autoComplete="current-password"
                required
              />
              <div className="forgot-password">
                <a href="#" onClick={handleForgotPassword}>Forgot Password?</a>
              </div>
            </div>

            <button type="submit" className="btn">
              Sign In
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

