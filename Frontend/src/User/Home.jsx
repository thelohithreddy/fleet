import "./Home.css";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { jwtDecode } from "jwt-decode";
import useBookingStore from "../../store/BookingStore";
import { INDIAN_CITIES_BY_STATE } from "../data/indianCities";
import { getDefaultSearchForm } from "../utils/bookingDefaults";
import {
  WELCOME_DISCOUNT_PERCENT,
  LONG_TRIP_DAYS,
  LONG_TRIP_DISCOUNT_PERCENT,
  HOURLY_DISCOUNT_THRESHOLD_6,
  HOURLY_DISCOUNT_THRESHOLD_10,
  HOURLY_DISCOUNT_6H_PERCENT,
  HOURLY_DISCOUNT_10H_PERCENT,
} from "../config/app.js";

function Home() {
  const navigate = useNavigate();
  const resetBookingData = useBookingStore((state) => state.resetBookingData);
  const { updateBookingData, error: storeError } = useBookingStore();

  useEffect(() => {
    const defaults = getDefaultSearchForm();
    resetBookingData();
    setFormData(defaults);
  }, [resetBookingData]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const userId = decoded.id || decoded._id || decoded.userId;
        if (userId) updateBookingData({ userId });
      } catch (err) {
        console.error("Invalid token", err);
      }
    }
  }, [updateBookingData]);

  const [formData, setFormData] = useState(getDefaultSearchForm);

  const [formErrors, setFormErrors] = useState({});

  const tripDuration = useMemo(() => {
    const pickup = new Date(`${formData.pickupDate}T${formData.pickupTime}`);
    const return_ = new Date(`${formData.returnDate}T${formData.returnTime}`);
    return Math.max(1, Math.ceil((return_ - pickup) / (1000 * 60 * 60 * 24)));
  }, [formData.pickupDate, formData.pickupTime, formData.returnDate, formData.returnTime]);

  const isLongTrip = tripDuration >= LONG_TRIP_DAYS;

  const validateForm = () => {
    const errors = {};
    if (!formData.city.trim()) errors.city = "Please select a city";
    if (!formData.pickupDate) errors.pickupDate = "Pickup date required";
    if (!formData.pickupTime) errors.pickupTime = "Pickup time required";
    if (!formData.returnDate) errors.returnDate = "Return date required";
    if (!formData.returnTime) errors.returnTime = "Return time required";
    if (!formData.withDriver && !formData.ownDriving)
      errors.drivingOption = "Select a driving option";

    const pickup = new Date(`${formData.pickupDate}T${formData.pickupTime}`);
    const return_ = new Date(`${formData.returnDate}T${formData.returnTime}`);
    const now = new Date();

    if (pickup < now) errors.pickupDate = "Pickup must be in the future";
    if (return_ <= pickup) errors.returnDate = "Return must be after pickup";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;

    if (type === "radio") {
      setFormData({
        ...formData,
        withDriver: name === "drive" && value === "driver",
        ownDriving: name === "drive" && value === "own",
      });
      setFormErrors((prev) => ({ ...prev, drivingOption: "" }));
    } else {
      setFormData({ ...formData, [name]: value });
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSearch = () => {
    if (!validateForm()) return;

    const pickup = new Date(`${formData.pickupDate}T${formData.pickupTime}`);
    const return_ = new Date(`${formData.returnDate}T${formData.returnTime}`);
    const duration = Math.max(
      1,
      Math.ceil((return_ - pickup) / (1000 * 60 * 60 * 24))
    );

    updateBookingData({ ...formData, duration });
    navigate("/home/vehicles");
  };

  return (
    <div className="home-page">
      <div className="home-offers-bar">
        <span className="home-offer home-offer--welcome">
          🎉 WELCOME20 — {WELCOME_DISCOUNT_PERCENT}% off first booking
        </span>
        <span className="home-offer home-offer--hourly">
          ⏱️ 6h+ trips: {HOURLY_DISCOUNT_6H_PERCENT}% off/hr · 10h+: {HOURLY_DISCOUNT_10H_PERCENT}% off/hr
        </span>
        {isLongTrip && (
          <span className="home-offer home-offer--long">
            📅 {tripDuration}-day trip — unlock up to {LONG_TRIP_DISCOUNT_PERCENT}% subscription savings
          </span>
        )}
      </div>

      <section className="home-hero">
        <div className="home-hero__overlay" />
        <div className="home-hero__content">
          <p className="home-hero__eyebrow">India&apos;s trusted car rental</p>
          <h1 className="home-hero__title">
            Drive your way.
            <br />
            <span>Book in minutes.</span>
          </h1>
          <p className="home-hero__subtitle">
            Self-drive &amp; chauffeur cars in 100+ Indian cities — transparent pricing, instant confirmation.
          </p>
          <div className="home-hero__badges">
            <span>✓ Sanitized cars</span>
            <span>✓ 24/7 support</span>
            <span>✓ Host &amp; earn</span>
          </div>
        </div>
      </section>

      <section className="home-booking-wrap">
        <div className="home-booking-card">
          <h2 className="home-booking-card__title">Find your ride</h2>
          <p className="home-booking-card__subtitle">
            Select city, dates &amp; how you want to drive
          </p>

          <div className="home-field">
            <label htmlFor="city">City</label>
            <select
              id="city"
              className={formErrors.city ? "home-input home-input--error" : "home-input"}
              name="city"
              value={formData.city}
              onChange={handleInputChange}
            >
              {Object.entries(INDIAN_CITIES_BY_STATE).map(([state, cities]) => (
                <optgroup key={state} label={state}>
                  {cities.map((city) => (
                    <option key={`${state}-${city}`} value={city}>
                      {city}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            {formErrors.city && <span className="home-error">{formErrors.city}</span>}
          </div>

          <div className="home-row">
            <div className="home-field">
              <label htmlFor="pickupDate">Pickup date</label>
              <input
                id="pickupDate"
                type="date"
                className={formErrors.pickupDate ? "home-input home-input--error" : "home-input"}
                name="pickupDate"
                value={formData.pickupDate}
                onChange={handleInputChange}
                min={new Date().toISOString().split("T")[0]}
              />
              {formErrors.pickupDate && (
                <span className="home-error">{formErrors.pickupDate}</span>
              )}
            </div>
            <div className="home-field">
              <label htmlFor="pickupTime">Pickup time</label>
              <input
                id="pickupTime"
                type="time"
                className={formErrors.pickupTime ? "home-input home-input--error" : "home-input"}
                name="pickupTime"
                value={formData.pickupTime}
                onChange={handleInputChange}
              />
              {formErrors.pickupTime && (
                <span className="home-error">{formErrors.pickupTime}</span>
              )}
            </div>
          </div>

          <div className="home-row">
            <div className="home-field">
              <label htmlFor="returnDate">Return date</label>
              <input
                id="returnDate"
                type="date"
                className={formErrors.returnDate ? "home-input home-input--error" : "home-input"}
                name="returnDate"
                value={formData.returnDate}
                onChange={handleInputChange}
                min={formData.pickupDate || new Date().toISOString().split("T")[0]}
              />
              {formErrors.returnDate && (
                <span className="home-error">{formErrors.returnDate}</span>
              )}
            </div>
            <div className="home-field">
              <label htmlFor="returnTime">Return time</label>
              <input
                id="returnTime"
                type="time"
                className={formErrors.returnTime ? "home-input home-input--error" : "home-input"}
                name="returnTime"
                value={formData.returnTime}
                onChange={handleInputChange}
              />
              {formErrors.returnTime && (
                <span className="home-error">{formErrors.returnTime}</span>
              )}
            </div>
          </div>

          {isLongTrip && (
            <div className="home-long-trip-hint">
              <strong>Long-trip subscription:</strong> {tripDuration} days selected — we&apos;ll highlight best-value cars for extended rentals.
            </div>
          )}

          <div className="home-field">
            <label>Trip type</label>
            <div className={`home-trip-type ${formErrors.drivingOption ? "home-trip-type--error" : ""}`}>
              <label className={`home-trip-option ${formData.ownDriving ? "home-trip-option--active" : ""}`}>
                <input
                  type="radio"
                  name="drive"
                  value="own"
                  checked={formData.ownDriving}
                  onChange={handleInputChange}
                />
                <span className="home-trip-option__icon">🚗</span>
                <span className="home-trip-option__label">Self drive</span>
                <span className="home-trip-option__hint">You drive</span>
              </label>
              <label className={`home-trip-option ${formData.withDriver ? "home-trip-option--active" : ""}`}>
                <input
                  type="radio"
                  name="drive"
                  value="driver"
                  checked={formData.withDriver}
                  onChange={handleInputChange}
                />
                <span className="home-trip-option__icon">👤</span>
                <span className="home-trip-option__label">With driver</span>
                <span className="home-trip-option__hint">Chauffeur included</span>
              </label>
            </div>
            {formErrors.drivingOption && (
              <span className="home-error">{formErrors.drivingOption}</span>
            )}
          </div>

          <button type="button" className="home-search-btn" onClick={handleSearch}>
            Search cars
          </button>

          {storeError && <p className="home-error home-error--center">{storeError}</p>}
        </div>
      </section>

      <section className="home-features">
        <div className="home-features__grid">
          <article className="home-feature">
            <span className="home-feature__icon">⚡</span>
            <h3>Instant booking</h3>
            <p>Pick dates, choose a car, confirm — done in under 2 minutes.</p>
          </article>
          <article className="home-feature">
            <span className="home-feature__icon">💰</span>
            <h3>No hidden fees</h3>
            <p>See the full price upfront before you book.</p>
          </article>
          <article className="home-feature">
            <span className="home-feature__icon">🏠</span>
            <h3>Host &amp; earn</h3>
            <p>List your car when idle and earn from every trip.</p>
          </article>
        </div>
      </section>
    </div>
  );
}

export default Home;
