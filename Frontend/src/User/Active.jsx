import React, { useEffect } from "react";
import "./Active.css";
import BookingCard1 from "./BookingCard1";
import { NavLink } from "react-router-dom";
import useUserBookingStore from "../../store/userActivePast";

function Active() {
  const { activeBookings, fetchActiveBookings, loading, error } = useUserBookingStore();

  useEffect(() => {
    fetchActiveBookings();
  }, [fetchActiveBookings]);

  if (loading) return <p>Loading active bookings...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="app-container_active">
      <div className="body_active">
        <div className="tabs_active">
          <NavLink to="/home/active" className="active_active selected">
            Active
          </NavLink>
          <NavLink to="/home/past" className="past_active">
            Past journey
          </NavLink>
        </div>

        {activeBookings.length > 0 ? (
          activeBookings.map((booking, index) => (
            <BookingCard1 key={index} booking={booking} />
          ))
        ) : (
          <h4 className="no-car-active">No car is booked yet</h4>
        )}
      </div>
    </div>
  );
}

export default Active;