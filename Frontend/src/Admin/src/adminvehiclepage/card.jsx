import "./adminvehicle.css";
import React from "react";

function Card(props) {
  if (props.isAddCard) {
    return (
      <div className="card add-card" onClick={props.onAdd}>
        <h2>+ Add Vehicle</h2>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>{props.name}</h2>
      <img src={props.image} alt={props.name} />
      <p>Type: {props.type}</p>
      <p>Price: {props.price}</p>
      <p>Availability: {props.availability}</p>
      <div className="card-buttons">
        <button className="details-btn">View Details</button>
        <button className="edit-btn" onClick={() => props.onEdit(props)}>
          Edit
        </button>
        <button className="delete-btn" onClick={() => props.onDelete(props)}>
          Delete
        </button>
      </div>
      <span className="rating">{props.rating}</span>
    </div>
  );
}

export default Card;
