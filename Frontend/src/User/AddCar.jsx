import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Vehicle.css";

function AddCar({ onAddVehicle, editingVehicle }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    type: "Car",
    name: "",
    price: "",
    availability: "Yes",
    rating: "0.0",
    image: "",
    fuelType: "Petrol",
    seatingCapacity: "",
    registrationPlate: "",
    vehicleId: "",
    driverName: "",
  });
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (editingVehicle) {
      setFormData(editingVehicle);
      setImagePreview(editingVehicle.image);
    }
  }, [editingVehicle]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type === "image/jpeg") {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData((prev) => ({
            ...prev,
            image: reader.result,
          }));
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        alert("Please upload a JPG image only");
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const cardData = {
      type: formData.type,
      name: formData.name,
      price: formData.price,
      availability: formData.availability,
      rating: formData.rating,
      image: formData.image || "Images/default-car.png",
      fuelType: formData.fuelType,
      seatingCapacity: formData.seatingCapacity,
      registrationPlate: formData.registrationPlate,
      vehicleId: formData.vehicleId,
      driverName: formData.driverName,
    };
    onAddVehicle(cardData);
    navigate("/admincarspage");
  };

  return (
    <div className="form-container">
      <h2>{editingVehicle ? "Edit Vehicle" : "Add New Vehicle"}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
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

        <div className="form-group">
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

        <div className="form-group">
          <label>Price per Day:</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            placeholder="Enter price per day"
            required
          />
        </div>

        <div className="form-group">
          <label>Availability:</label>
          <select
            name="availability"
            value={formData.availability}
            onChange={handleChange}
            required
          >
            <option value="Yes">Available</option>
            <option value="No">Not Available</option>
          </select>
        </div>

        <div className="form-group">
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

        <div className="form-group">
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

        <div className="form-group">
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

        <div className="form-group">
          <label>Seating Capacity:</label>
          <input
            type="number"
            name="seatingCapacity"
            value={formData.seatingCapacity}
            onChange={handleChange}
            placeholder="Enter seating capacity"
            required
          />
        </div>

        <div className="form-group">
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

        <div className="form-group">
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

        <div className="form-group">
          <label>Vehicle Image (JPG only):</label>
          <div className="image-upload-container">
            <input
              type="file"
              accept=".jpg,.jpeg"
              onChange={handleImageUpload}
              className="image-upload-input"
            />
            {imagePreview && (
              <div className="image-preview">
                <img src={imagePreview} alt="Vehicle preview" />
              </div>
            )}
          </div>
        </div>

        <button type="submit">
          {editingVehicle ? "Update Vehicle" : "Add Vehicle"}
        </button>
      </form>
    </div>
  );
}

export default AddCar;