import React from "react";
import "./adddriver.css";

function DriverCard(props) {
  if (props.isAddCard) {
    return (
      <div className=" add-card-driver" onClick={props.onAdd}>
        <h2>+ Add Driver</h2>
      </div>
    );
  }

  return (
    <div className="driver-card">
      <img
        src={props.image || "Images/default-driver.png"}
        alt={props.name}
        className="driver-image"
      />
      <div className="driver-content">
        <div className="driver-details">
          <p>
            <strong>Name:</strong> {props.name}
          </p>
          <p>
            <strong>Age:</strong> {props.age}
          </p>
          <p>
            <strong>Phone:</strong> {props.phone}
          </p>
        </div>
        <div className="driver-info">
          <p>
            <strong>License:</strong> {props.license}
          </p>
          <p>
            <strong>Vehicle ID:</strong> {props.vehicleId}
          </p>
          <p>
            <strong>Driver ID:</strong> {props.driverId}
          </p>
        </div>
      </div>
      <div className="card-buttons">
       
        <button className="edit-btn" onClick={props.onEdit}>
          Edit
        </button>
        <button className="delete-btn" onClick={props.onDelete}>
          Delete
        </button>
      </div>
    </div>
  );
}

export default DriverCard;
