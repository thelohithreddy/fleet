import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./HostVehicle.css";
import { INDIAN_CITIES_BY_STATE, DEFAULT_CITY } from "../data/indianCities";
import {
  HOURLY_DISCOUNT_THRESHOLD_6,
  HOURLY_DISCOUNT_THRESHOLD_10,
  HOURLY_DISCOUNT_6H_PERCENT,
  HOURLY_DISCOUNT_10H_PERCENT,
} from "../config/app.js";
import useUserStore from "../../store/UserStore";

const initialForm = {
  name: "",
  type: "Car",
  price: "",
  pricePerHour: "",
  city: DEFAULT_CITY,
  fuelType: "Petrol",
  transmission: "Manual",
  seatingCapacity: "",
  modelYear: "",
  registrationPlate: "",
  vehicleId: "",
  image: "",
  hostAddress: "",
  description: "",
};

export default function HostVehicle() {
  const { listHostVehicle, getMyHostedVehicles } = useUserStore();
  const [form, setForm] = useState(initialForm);
  const [myVehicles, setMyVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    getMyHostedVehicles()
      .then(setMyVehicles)
      .catch(() => {});
  }, [getMyHostedVehicles]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const validateForm = () => {
    if (!form.image.trim()) {
      return "Vehicle image URL is required";
    }
    try {
      const u = new URL(form.image.trim());
      if (u.protocol !== "http:" && u.protocol !== "https:") {
        return "Image URL must start with http:// or https://";
      }
    } catch {
      return "Enter a valid image URL (http or https)";
    }
    if (!form.pricePerHour || Number(form.pricePerHour) <= 0) {
      return "Price per hour is required and must be greater than zero";
    }
    if (!form.price || Number(form.price) <= 0) {
      return "Price per day is required and must be greater than zero";
    }
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    setLoading(true);
    try {
      const res = await listHostVehicle(form);
      setSuccess(res.message || "Vehicle listed successfully!");
      setForm({ ...initialForm, city: DEFAULT_CITY });
      const updated = await getMyHostedVehicles();
      setMyVehicles(updated);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed to list vehicle");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="host-page">
      <div className="host-page__inner">
        <div className="host-hero">
          <h1>Host &amp; earn</h1>
          <p>
            List your car on Fleet — it goes into the <strong>same fleet database as admin listings</strong> and appears instantly in search for your city.
          </p>
          <p className="host-pricing-note">
            Hourly pricing: bookings over {HOURLY_DISCOUNT_THRESHOLD_6}h get {HOURLY_DISCOUNT_6H_PERCENT}% off per hour;
            over {HOURLY_DISCOUNT_THRESHOLD_10}h get {HOURLY_DISCOUNT_10H_PERCENT}% off per hour.
          </p>
        </div>

        <form className="host-form" onSubmit={handleSubmit}>
          <h2>List your vehicle</h2>

          {error && <div className="host-alert host-alert--error">{error}</div>}
          {success && <div className="host-alert host-alert--success">{success}</div>}

          <div className="host-grid">
            <div className="host-field">
              <label>Vehicle name *</label>
              <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Honda City 2022" required />
            </div>
            <div className="host-field">
              <label>Type *</label>
              <select name="type" value={form.type} onChange={handleChange}>
                <option value="Car">Car</option>
                <option value="Bike">Bike</option>
                <option value="Van">Van</option>
                <option value="Truck">Truck</option>
              </select>
            </div>
            <div className="host-field">
              <label>Price per hour (₹) *</label>
              <input name="pricePerHour" type="number" min="1" step="1" value={form.pricePerHour} onChange={handleChange} placeholder="e.g. 150" required />
            </div>
            <div className="host-field">
              <label>Price per day (₹) *</label>
              <input name="price" type="number" min="1" step="1" value={form.price} onChange={handleChange} placeholder="e.g. 2000" required />
            </div>
            <div className="host-field">
              <label>City *</label>
              <select name="city" value={form.city} onChange={handleChange} required>
                {Object.entries(INDIAN_CITIES_BY_STATE).map(([state, cities]) => (
                  <optgroup key={state} label={state}>
                    {cities.map((c) => (
                      <option key={`${state}-${c}`} value={c}>{c}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
            <div className="host-field">
              <label>Model year</label>
              <input name="modelYear" type="number" min="1990" max="2030" value={form.modelYear} onChange={handleChange} placeholder="2022" />
            </div>
            <div className="host-field host-field--full">
              <label>Pickup address *</label>
              <input name="hostAddress" value={form.hostAddress} onChange={handleChange} placeholder="Full address with landmark" required />
            </div>
            <div className="host-field">
              <label>Fuel type *</label>
              <select name="fuelType" value={form.fuelType} onChange={handleChange}>
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="Electric">Electric</option>
              </select>
            </div>
            <div className="host-field">
              <label>Transmission *</label>
              <select name="transmission" value={form.transmission} onChange={handleChange}>
                <option value="Manual">Manual</option>
                <option value="Automatic">Automatic</option>
              </select>
            </div>
            <div className="host-field">
              <label>Seating capacity *</label>
              <input name="seatingCapacity" type="number" min="1" max="20" value={form.seatingCapacity} onChange={handleChange} required />
            </div>
            <div className="host-field">
              <label>Registration plate *</label>
              <input name="registrationPlate" value={form.registrationPlate} onChange={handleChange} placeholder="UP32 AB 1234" required />
            </div>
            <div className="host-field">
              <label>Vehicle ID *</label>
              <input name="vehicleId" value={form.vehicleId} onChange={handleChange} placeholder="Unique ID e.g. HOST-001" required />
            </div>
            <div className="host-field host-field--full">
              <label>Image URL *</label>
              <input name="image" type="url" value={form.image} onChange={handleChange} placeholder="https://example.com/car.jpg" required />
              <span className="host-field-hint">Direct link to a JPG/PNG/WebP image (required)</span>
            </div>
            <div className="host-field host-field--full">
              <label>Description</label>
              <textarea name="description" rows={3} value={form.description} onChange={handleChange} placeholder="Features, condition, rules for renters…" />
            </div>
          </div>

          {form.image.trim() && (
            <div className="host-image-preview">
              <img
                src={form.image}
                alt="Preview"
                onError={(e) => { e.target.style.display = "none"; }}
              />
            </div>
          )}

          <button type="submit" className="host-submit" disabled={loading}>
            {loading ? "Listing…" : "List my car"}
          </button>
        </form>

        {myVehicles.length > 0 && (
          <section className="host-listings">
            <h2>Your listings ({myVehicles.length})</h2>
            <p className="host-listings__note">These appear in user search and in the admin vehicle list.</p>
            <div className="host-listings__grid">
              {myVehicles.map((v) => (
                <article key={v._id} className="host-listing-card">
                  {v.image && <img src={v.image} alt={v.name} className="host-listing-card__img" />}
                  <h3>{v.name}</h3>
                  <p>{v.city} · ₹{v.pricePerHour || "—"}/hr · ₹{v.price}/day</p>
                  <p className="host-listing-card__addr">{v.hostAddress}</p>
                  <span className="host-status host-status--approved">Live in fleet</span>
                </article>
              ))}
            </div>
          </section>
        )}

        <p className="host-back">
          <Link to="/home">← Back to home</Link>
        </p>
      </div>
    </div>
  );
}
