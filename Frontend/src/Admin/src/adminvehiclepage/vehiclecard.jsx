import React from "react";
import "./adminvehicle.css";

function VehicleCard({ vehicle, onEdit, onDelete }) {
  console.log("Rendering vehicle card:", vehicle);
  
  return (
    <div className="vehicle-card">
      <div className="vehicle-image">
        <img src={vehicle.image} alt={vehicle.name} />
      </div>
      <div className="vehicle-details">
        <h3>
          {vehicle.name || "Unnamed Vehicle"}
          {vehicle.hostUserId && (
            <span style={{ marginLeft: 8, fontSize: "0.7rem", background: "#fef3c7", color: "#92400e", padding: "2px 8px", borderRadius: 999 }}>
              Host listing
            </span>
          )}
        </h3>
        <p>Type: {vehicle.type}</p>
        <p>Price: ₹{vehicle.pricePerHour ? `${vehicle.pricePerHour}/hr · ` : ""}{vehicle.price}/day</p>
        {vehicle.hostAddress && <p>Host address: {vehicle.hostAddress}</p>}
        <p>Availability: {vehicle.availability}</p>
        <p>Rating: {vehicle.rating} ⭐</p>
        <p>Driver: {vehicle.driverName || "No Driver"}</p>
        <p>City: {vehicle.city}</p>
        <p>Fuel Type: {vehicle.fuelType}</p>
        <p>Seating Capacity: {vehicle.seatingCapacity}</p>
        <p>Registration Plate: {vehicle.registrationPlate}</p>
        <p>Vehicle ID: {vehicle.vehicleId}</p>
      </div>
      <div className="vehicle-actions">
        <button onClick={() => onEdit(vehicle)} className="edit-btn">
          Edit
        </button>
        <button onClick={() => onDelete(vehicle)} className="delete-btn">
          Delete
        </button>
      </div>
    </div>
  );
}

export default VehicleCard;
