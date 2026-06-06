import React, { useEffect } from "react";
import "./Active.css";
import BookingCard1 from "./BookingCard1";
import { NavLink, useNavigate } from "react-router-dom";
import useUserBookingStore from "../../store/userActivePast";

function Active() {
  const navigate = useNavigate();
  const { activeBookings, fetchActiveBookings, loading, error } = useUserBookingStore();

  useEffect(() => {
    fetchActiveBookings();
  }, [fetchActiveBookings]);

  if (loading) {
    return (
      <div className="app-container_active">
        <div className="body_active">
          <div className="fleet-loading">
            <div className="fleet-spinner" />
            <p>Loading your trips…</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-container_active">
        <div className="body_active">
          <div className="fleet-empty">
            <p className="fleet-empty__title">Something went wrong</p>
            <p className="fleet-empty__text">{error}</p>
            <button className="fleet-btn fleet-btn--primary" onClick={() => fetchActiveBookings()}>
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container_active">
      <div className="body_active">
        <div className="fleet-page__header">
          <h1 className="fleet-page__title">My trips</h1>
          <p className="fleet-page__subtitle">Manage your active and past bookings</p>
        </div>

        <div className="tabs_active">
          <NavLink to="/home/active" className={({ isActive }) => `active_active${isActive ? " selected" : ""}`}>
            Active
          </NavLink>
          <NavLink to="/home/past" className={({ isActive }) => `past_active${isActive ? " selected" : ""}`}>
            Past journeys
          </NavLink>
        </div>

        {activeBookings.length > 0 ? (
          activeBookings.map((booking, index) => (
            <BookingCard1 key={booking.bookingId || index} booking={booking} />
          ))
        ) : (
          <div className="fleet-empty">
            <div className="fleet-empty__icon">🚗</div>
            <p className="fleet-empty__title">No active bookings</p>
            <p className="fleet-empty__text">Book a car and your trip details will show up here.</p>
            <button className="fleet-btn fleet-btn--primary" onClick={() => navigate("/home")}>
              Find a car
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Active;
