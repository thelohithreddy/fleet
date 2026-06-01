import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./adminvehicle.css";

function AddCar({ onAddVehicle, editingVehicle }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    type: "Car",
    name: "",
    price: "",
    city: "Delhi",
    availability: "Available",
    rating: "0.0",
    image: "",
    fuelType: "Petrol",
    seatingCapacity: "",
    registrationPlate: "",
    vehicleId: "",
    driverName: "",
    hasDriver: true,
    driverId: "",
  });

  useEffect(() => {
    if (editingVehicle) {
      setFormData({
        ...editingVehicle,
        hasDriver: editingVehicle.driverName ? true : false,
        driverName: editingVehicle.driverName || "",
        driverId: editingVehicle.driverId || "",
      });
    }
  }, [editingVehicle]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleDriverChange = (e) => {
    const value = e.target.value === "true";
    setFormData((prevState) => ({
      ...prevState,
      hasDriver: value,
      driverName: value ? (prevState.driverName || "") : "",
      driverId: value ? (prevState.driverId || "") : "",
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate vehicle name
    if (!formData.name.trim()) {
      alert("Please enter vehicle name");
      return;
    }

    // Validate driver information if hasDriver is true
    if (formData.hasDriver) {
      if (!formData.driverName.trim()) {
        alert("Please enter driver name");
        return;
      }
      if (!formData.driverId.trim()) {
        alert("Please enter driver ID");
        return;
      }
    }

    const cardData = {
      type: formData.type,
      name: formData.name,
      price: formData.price,
      availability: formData.availability,
      rating: parseFloat(formData.rating).toFixed(1),
      city: formData.city,
      image: formData.image || "Images/default-car.png",
      fuelType: formData.fuelType,
      seatingCapacity: formData.seatingCapacity,
      registrationPlate: formData.registrationPlate,
      vehicleId: formData.vehicleId,
      hasDriver: formData.hasDriver,
      driverName: formData.hasDriver ? formData.driverName.trim() : "No Driver",
      driverId: formData.hasDriver ? formData.driverId.trim() : "",
    };

    console.log("Submitting vehicle data:", cardData);

    try {
      onAddVehicle(cardData);
      navigate("/admin/vehicles");
    } catch (error) {
      console.error("Error adding vehicle:", error);
      alert("Failed to add vehicle. Please try again.");
    }
  };

  return (
    <div className="add-car-container">
      <h2>{editingVehicle ? "Edit Vehicle" : "Add New Vehicle"}</h2>
      <form onSubmit={handleSubmit} className="add-car-form">
        <div className="radio-container">
          <div className="radio-group">
            <label>
              <input
                type="radio"
                name="hasDriver"
                value={true}
                checked={formData.hasDriver === true}
                onChange={handleDriverChange}
              />
              <span>With Driver</span>
            </label>
            <label>
              <input
                type="radio"
                name="hasDriver"
                value={false}
                checked={formData.hasDriver === false}
                onChange={handleDriverChange}
              />
              <span>Without Driver</span>
            </label>
          </div>
        </div>

        {formData.hasDriver && (
          <>
            <div className="form-group_a">
              <label>Driver Name:</label>
              <input
                type="text"
                name="driverName"
                value={formData.driverName}
                onChange={handleChange}
                placeholder="Enter driver name"
                required
              />
            </div>
            <div className="form-group_a">
              <label>Driver ID:</label>
              <input
                type="text"
                name="driverId"
                value={formData.driverId}
                onChange={handleChange}
                placeholder="Enter driver ID"
                required
              />
            </div>
          </>
        )}

        <div className="form-group_a">
          <label>Vehicle Type:</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
          >
            <option value="Car">Car</option>
            <option value="Bike">Bike</option>
            <option value="Van">Van</option>
            <option value="Truck">Truck</option>
          </select>
        </div>

        <div className="form-group_a">
          <label>City:</label>
          <select
            name="city"
            value={formData.city}
            onChange={handleChange}
            required
          >
            <option value="Kanpur">Kanpur</option>
            <option value="Delhi">Delhi</option>
            <option value="Lucknow">Lucknow</option>

          </select>
        </div>

        <div className="form-group_a">
          <label>Vehicle Name:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter vehicle name"
            required
          />
        </div>

        <div className="form-group_a">
          <label>Price per Day:</label>
          <input
            type="number"
            name="price"
            min="0"

            value={formData.price}
            onChange={handleChange}
            placeholder="Enter price per day"
            required
          />
        </div>

        <div className="form-group_a">
          <label>Availability:</label>
          <select
            name="availability"
            value={formData.availability}
            onChange={handleChange}
            required
          >
            <option value="Available">Available</option>
            <option value="Not Available">Not Available</option>
          </select>
        </div>

        <div className="form-group_a">
          <label>Initial Rating:</label>
          <input
            type="number"
            name="rating"
            value={formData.rating}
            onChange={handleChange}
            min="0"
            max="5"
            step="0.1"
            required
          />
        </div>

        <div className="form-group_a">
          <label>Fuel Type:</label>
          <select
            name="fuelType"
            value={formData.fuelType}
            onChange={handleChange}
            required
          >
            <option value="Petrol">Petrol</option>
            <option value="Diesel">Diesel</option>
            <option value="Electric">Electric</option>
            <option value="Hybrid">Hybrid</option>
          </select>
        </div>

        <div className="form-group_a">
          <label>Seating Capacity:</label>
          <input
            type="number"
            name="seatingCapacity"
            min="0"
            max="12"
            value={formData.seatingCapacity}
            onChange={handleChange}
            placeholder="Enter seating capacity"
            required
          />
        </div>

        <div className="form-group_a">
          <label>Registration Plate:</label>
          <input
            type="text"
            name="registrationPlate"
            value={formData.registrationPlate}
            onChange={handleChange}
            placeholder="Enter registration plate"
            required
          />
        </div>

        <div className="form-group_a">
          <label>Vehicle ID:</label>
          <input
            type="text"
            name="vehicleId"
            value={formData.vehicleId}
            onChange={handleChange}
            placeholder="Enter vehicle ID"
            required
          />
        </div>

        <div className="form-group_a">
          <label>Vehicle Image URL:</label>
          <input
            type="url"
            name="image"
            value={formData.image}
            onChange={handleChange}
            placeholder="Enter image URL"
            required
          />
          {formData.image && (
            <div className="image-preview">
              <img src={formData.image} alt="Vehicle preview" />
            </div>
          )}
        </div>

        <button type="submit">
          {editingVehicle ? "Update Vehicle" : "Add Vehicle"}
        </button>
      </form>
    </div>
  );
}

export default AddCar;