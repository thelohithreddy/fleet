import React, { useEffect } from "react";
import "./Past.css";
import BookingCard from "./BookingCard.jsx";
import { NavLink, useNavigate } from "react-router-dom";
import useUserBookingStore from "../../store/userActivePast";

function Past() {
  const navigate = useNavigate();
  const { pastBookings, fetchPastBookings, loading, error } = useUserBookingStore();

  useEffect(() => {
    fetchPastBookings();
  }, [fetchPastBookings]);

  if (loading) {
    return (
      <div className="app-container_past">
        <div className="body_past">
          <div className="fleet-loading">
            <div className="fleet-spinner" />
            <p>Loading past trips…</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-container_past">
        <div className="body_past">
          <div className="fleet-empty">
            <p className="fleet-empty__title">Something went wrong</p>
            <p className="fleet-empty__text">{error}</p>
            <button className="fleet-btn fleet-btn--primary" onClick={() => fetchPastBookings()}>
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container_past">
      <div className="body_past">
        <div className="fleet-page__header">
          <h1 className="fleet-page__title">My trips</h1>
          <p className="fleet-page__subtitle">Manage your active and past bookings</p>
        </div>

        <div className="tabs_past">
          <NavLink to="/home/active" className={({ isActive }) => `active_active${isActive ? " selected" : ""}`}>
            Active
          </NavLink>
          <NavLink to="/home/past" className={({ isActive }) => `past_active${isActive ? " selected" : ""}`}>
            Past journeys
          </NavLink>
        </div>

        {pastBookings.length > 0 ? (
          pastBookings.map((booking, index) => (
            <BookingCard key={booking.bookingId || index} booking={booking} />
          ))
        ) : (
          <div className="fleet-empty">
            <div className="fleet-empty__icon">📋</div>
            <p className="fleet-empty__title">No past bookings yet</p>
            <p className="fleet-empty__text">Completed trips will appear here for your records.</p>
            <button className="fleet-btn fleet-btn--primary" onClick={() => navigate("/home")}>
              Book your first ride
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Past;
