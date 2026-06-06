import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";
import fleetLogo from "../../../public/greylogo.png";
import useAuthStore from "../../../store/AuthStore.js";
import { OTP_RESEND_COOLDOWN_SEC } from "../../config/app.js";

export default function OTPVerification() {
  const navigate = useNavigate();
  const { email, resendOtp, verifyOtp } = useAuthStore();
  const verifyLockRef = useRef(false);

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(OTP_RESEND_COOLDOWN_SEC);
  const [resendEnabled, setResendEnabled] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const inputsLocked = isVerifying || isVerified || isResending;

  useEffect(() => {
    if (timer <= 0) {
      setResendEnabled(true);
      return;
    }
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const showMessage = (text, type = "error") => {
    setMessage(text);
    setMessageType(type);
  };

  const handleChange = (index, value) => {
    if (inputsLocked || !/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < otp.length - 1) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    } else if (!value && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (inputsLocked) return;
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const newOtp = [...otp];
      newOtp[index - 1] = "";
      setOtp(newOtp);
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
    if (e.key === "Enter") {
      e.preventDefault();
      handleVerifyOtp();
    }
  };

  const handleVerifyOtp = async () => {
    if (verifyLockRef.current || isVerifying || isVerified) return;

    const enteredOtp = otp.join("");
    if (!enteredOtp || enteredOtp.length !== 6) {
      showMessage("Please enter a valid 6-digit OTP");
      return;
    }

    verifyLockRef.current = true;
    setIsVerifying(true);
    showMessage("");

    try {
      const res = await verifyOtp(enteredOtp);
      if (res.success) {
        setIsVerified(true);
        showMessage("Email verified! Redirecting to sign in...", "success");
        setTimeout(() => navigate("/auth/signin", { replace: true }), 1200);
      } else {
        showMessage(res.message || "OTP verification failed");
        verifyLockRef.current = false;
      }
    } catch (error) {
      showMessage(error.message || "Invalid OTP. Please try again.");
      verifyLockRef.current = false;
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    if (isResending || isVerified || !resendEnabled) return;

    setIsResending(true);
    showMessage("");

    try {
      await resendOtp();
      setOtp(["", "", "", "", "", ""]);
      setTimer(OTP_RESEND_COOLDOWN_SEC);
      setResendEnabled(false);
      verifyLockRef.current = false;
      showMessage("New OTP sent. Use the code from your latest email.", "success");
      document.getElementById("otp-0")?.focus();
    } catch (error) {
      showMessage(
        error.response?.data?.message ||
          error.message ||
          "Failed to resend OTP. Please try again."
      );
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="logo-section">
          <img src={fleetLogo} alt="Fleet" />
          <h1 className="brand">Verify your email</h1>
          <p className="tagline">We sent a 6-digit code to your inbox. Enter it below to continue.</p>
        </div>

        <div className="form-section">
          <h2 className="auth-title">Verify Your Email</h2>
          <p className="text-center mb-4">
            Enter the 6-digit code sent to
            <br />
            <strong>{email}</strong>
          </p>

          {message && (
            <div
              className={`alert ${
                messageType === "success" ? "alert-success" : "alert-danger"
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
                disabled={inputsLocked}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                autoComplete="one-time-code"
              />
            ))}
          </div>

          <button
            type="button"
            className="otp-verify-btn"
            onClick={handleVerifyOtp}
            disabled={inputsLocked}
            aria-busy={isVerifying}
          >
            {isVerified
              ? "Verified"
              : isVerifying
                ? "Verifying..."
                : "Verify OTP"}
          </button>

          <div className="auth-links">
            {!resendEnabled ? (
              <p className="timer-text">
                Resend OTP in {timer} second{timer !== 1 ? "s" : ""}
              </p>
            ) : (
              <button
                type="button"
                className="resend-otp-btn"
                onClick={handleResendOtp}
                disabled={isResending || isVerified}
              >
                {isResending ? "Sending..." : "Resend OTP"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
