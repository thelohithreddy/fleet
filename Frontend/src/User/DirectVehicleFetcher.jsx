import React, { useState, useEffect } from "react";
import axios from "axios";
import VehicleCard from "./VehicleCard";
import "./Vehicle.css";

function DirectVehicleFetcher({ bookingType }) {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("All");
  const [filteredVehicles, setFilteredVehicles] = useState([]);

  // Fetch vehicles directly from the admin endpoint
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get admin token from localStorage
        const adminToken = localStorage.getItem("adminToken");
        
        // Make direct API call to admin endpoint
        const response = await axios.get("/api/admin/vehicles", {
          headers: {
            Authorization: `Bearer ${adminToken}`
          }
        });
        
        console.log("Direct API response:", response.data);
        
        if (response.data.success) {
          // Normalize vehicle data
          const normalizedVehicles = response.data.vehicles.map(vehicle => ({
            _id: vehicle._id || vehicle.id,
            name: vehicle.name,
            type: vehicle.type,
            price: vehicle.price,
            availability: vehicle.availability,
            rating: vehicle.rating,
            driverName: vehicle.driverName || "",
            driverId: vehicle.driverId || "",
            fuelType: vehicle.fuelType,
            seatingCapacity: vehicle.seatingCapacity,
            registrationPlate: vehicle.registrationPlate,
            vehicleId: vehicle.vehicleId,
            city: vehicle.city,
            image: vehicle.image || "Images/default-car.png"
          }));
          
          console.log("Normalized vehicles:", normalizedVehicles);
          setVehicles(normalizedVehicles);
        } else {
          setError("Failed to fetch vehicles");
        }
      } catch (err) {
        console.error("Error fetching vehicles:", err);
        setError(err.message || "Failed to fetch vehicles");
      } finally {
        setLoading(false);
      }
    };
    
    fetchVehicles();
  }, []);

  // Apply filtering when filter or vehicles change
  useEffect(() => {
    let updatedVehicles = [...vehicles];
    
    if (filter === "Available") {
      updatedVehicles = updatedVehicles.filter(v => v.availability === "Available");
    } else if (filter === "Not available") {
      updatedVehicles = updatedVehicles.filter(v => v.availability === "Not available");
    } else if (filter === "Cars") {
      updatedVehicles = updatedVehicles.filter(v => v.type.toLowerCase() === "car");
    } else if (filter === "Bikes") {
      updatedVehicles = updatedVehicles.filter(v => v.type.toLowerCase() === "bike");
    } else if (filter === "Price") {
      updatedVehicles.sort((a, b) => a.price - b.price);
    } else if (filter === "Rating") {
      updatedVehicles.sort((a, b) => b.rating - a.rating);
    }
    
    setFilteredVehicles(updatedVehicles);
  }, [filter, vehicles]);

  const handleFilterChange = (selectedFilter) => {
    setFilter(selectedFilter);
  };

  return (
    <div className="main_v">
      <div className="filter-container">
        <button 
          className={filter === "All" ? "active" : ""} 
          onClick={() => handleFilterChange("All")}
        >
          All
        </button>
        <button 
          className={filter === "Available" ? "active" : ""} 
          onClick={() => handleFilterChange("Available")}
        >
          Available
        </button>
        <button 
          className={filter === "Not available" ? "active" : ""} 
          onClick={() => handleFilterChange("Not available")}
        >
          Not Available
        </button>
        <button 
          className={filter === "Cars" ? "active" : ""} 
          onClick={() => handleFilterChange("Cars")}
        >
          Cars
        </button>
        <button 
          className={filter === "Bikes" ? "active" : ""} 
          onClick={() => handleFilterChange("Bikes")}
        >
          Bikes
        </button>
        <button 
          className={filter === "Price" ? "active" : ""} 
          onClick={() => handleFilterChange("Price")}
        >
          Price
        </button>
        <button 
          className={filter === "Rating" ? "active" : ""} 
          onClick={() => handleFilterChange("Rating")}
        >
          Rating
        </button>
      </div>
      
      {loading && (
        <div className="loading-screen">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading vehicles...</p>
        </div>
      )}
      {error && <p className="error">Error: {error}</p>}
      
      <div className="card-container_v">
        {filteredVehicles.length === 0 && !loading && !error && (
          <p className="no-vehicles">No vehicles found matching your criteria.</p>
        )}
        {filteredVehicles.map((vehicle) => (
          <VehicleCard
            key={vehicle._id}
            vehicle={vehicle}
            bookingType={bookingType}
          />
        ))}
      </div>
    </div>
  );
}

export default DirectVehicleFetcher; 