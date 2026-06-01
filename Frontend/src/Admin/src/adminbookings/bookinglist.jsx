import React from "react";
import "./bookinglist.css";

function AdminbookingList({ bookings }) {
  return (
    <div className="booking-list">
      <h1 className="bookings-count">Number of Active Bookings: {bookings.length}</h1>
      {bookings.map((booking) => (
        <div key={booking.bookingId} className="booking-card">
          <div className="vehicle-info">
            <span className="vehicle-name">{booking.vehicleName}</span>
            {/* <span className="user-name">Username: {booking.userName}</span> */}
          </div>
          <div className="booking-details">
          <span className="user-fullname">Customer's Fullname: {booking.fullname}</span>
          <br />
          <span className="user-email">Customer's email: {booking.email}</span>
          <br />
            <span>Pickup Date and Time: {new Date(booking.pickupDate).toLocaleString()} </span>
            <br />
            <span>Return Date and Time: {new Date(booking.returnDate).toLocaleString()}</span>
          </div>
          
          <div className="driver-name">Driver's Name: {booking.driverName}</div>
          <div className="vehicle-id">Vehicle_id: {booking.vehicleId}</div>
          <div className="price">Price: {booking.totalAmount}</div>
        </div>
      ))}
      {console.log("Bookings:", bookings)}
    </div>
  );
}

export default AdminbookingList;