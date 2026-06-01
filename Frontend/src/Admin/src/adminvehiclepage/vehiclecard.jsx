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
        <h3>{vehicle.name || "Unnamed Vehicle"}</h3>
        <p>Type: {vehicle.type}</p>
        <p>Price: INR {vehicle.price}/day</p>
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
