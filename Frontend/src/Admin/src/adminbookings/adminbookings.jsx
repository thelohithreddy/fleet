import React, { useEffect } from "react";
import "./adminbookings.css";
import AdminbookingList from "./bookinglist";
import Calendar from "./calendar";
import useAdminBookingStore from "../../../../store/adminBookingStore";

function Adminbookingspage() {
  const { bookings, fetchBookingsByDate, loading, error } = useAdminBookingStore();

  const handleDateChange = (selectedDate) => {
    fetchBookingsByDate(selectedDate);
  };

  useEffect(() => {
    // Fetch bookings for the current date by default
    const today = new Date().toISOString().split("T")[0];
    fetchBookingsByDate(today);
  }, [fetchBookingsByDate]);

  return (
    <div className="app">
      <div className="sidebar">
        <Calendar onDateChange={handleDateChange} />
      </div>
      <div className="main-content">
        {loading && <p>Loading bookings...</p>}
        {error && <p>Error: {error}</p>}
        <AdminbookingList bookings={bookings} />
      </div>
    </div>
  );
}

export default Adminbookingspage;