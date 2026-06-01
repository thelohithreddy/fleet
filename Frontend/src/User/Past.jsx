import React, { useEffect, useState } from "react";
import "./Past.css";
import BookingCard from "./BookingCard.jsx";
import { NavLink } from "react-router-dom";
import useUserBookingStore from "../../store/userActivePast";

function Past() {
  const { pastBookings, fetchPastBookings, loading, error } = useUserBookingStore();

  useEffect(() => {
    fetchPastBookings();
  }, [fetchPastBookings]);

  if (loading) return <p>Loading past bookings...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="app-container_past">
      <div className="body_past">
        <div className="tabs_past">
          <NavLink to="/home/active" className="active_active">
            Active
          </NavLink>
          <NavLink to="/home/past" className="past_active selected">
            Past journey
          </NavLink>
        </div>

        {pastBookings.length > 0 ? (
          pastBookings.map((booking, index) => (
            <BookingCard key={index} booking={booking} />
          ))
        ) : (
          <h4 className="no-car-past">No past bookings yet</h4>
        )}
      </div>
    </div>
  );
}

export default Past;