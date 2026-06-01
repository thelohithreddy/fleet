import React, { useState, useEffect } from "react";
import axios from "axios";
import VehicleCard from "./VehicleCard";
import "./Vehicle.css";
import useBookingStore from "../../store/BookingStore";

function FixedVehicleFetcher({ bookingType }) {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("All");
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  
  // Get booking data from the store
  const { bookingData } = useBookingStore();
  
  // Determine if we're looking for vehicles with driver or without driver
  const withDriver = bookingType === "driver" || bookingData.withDriver;
  
  // Get the selected city from booking data
  const selectedCity = bookingData.city;

  // Log booking data for debugging
  useEffect(() => {
    console.log("FixedVehicleFetcher - Booking data from store:", bookingData);
    console.log("FixedVehicleFetcher - Booking type:", bookingType);
    console.log("FixedVehicleFetcher - With driver:", withDriver);
    console.log("FixedVehicleFetcher - Selected city:", selectedCity);
  }, [bookingData, bookingType, withDriver, selectedCity]);

  // Fetch vehicles directly from the vehicles endpoint
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Make direct API call to vehicles endpoint with the correct base URL
        console.log("Making API call to fetch vehicles...");
        
        // Use the correct endpoint format based on axios configuration
        const response = await axios.get("/admin/vehicles");
        
        console.log("Raw API response:", response);
        console.log("API response data:", response.data);
        console.log("Booking type:", bookingType);
        console.log("With driver:", withDriver);
        console.log("Booking data:", bookingData);
        console.log("Selected city:", selectedCity);
        
        // Handle different response structures
        let vehiclesData = [];
        
        if (response.data.success && response.data.vehicles) {
          // Structure: { success: true, vehicles: [...] }
          vehiclesData = response.data.vehicles;
          console.log("Using success.vehicles structure");
        } else if (Array.isArray(response.data)) {
          // Structure: [...]
          vehiclesData = response.data;
          console.log("Using array structure");
        } else if (response.data.vehicles && Array.isArray(response.data.vehicles)) {
          // Structure: { vehicles: [...] }
          vehiclesData = response.data.vehicles;
          console.log("Using vehicles array structure");
        } else {
          console.error("Unexpected response structure:", response.data);
          setError("Unexpected response structure from server");
          return;
        }
        
        console.log("Extracted vehicles data:", vehiclesData);
        
        if (vehiclesData.length === 0) {
          console.log("No vehicles found in the response");
          setVehicles([]);
          return;
        }
        
        // Normalize vehicle data
        const normalizedVehicles = vehiclesData.map(vehicle => {
          // Check if the vehicle has a driver based on driverName
          const hasDriver = vehicle.driverName && vehicle.driverName.trim() !== "";
          
          // Ensure city is properly set
          const city = vehicle.city || "New York";
          console.log(`Vehicle ${vehicle.name || vehicle._id} has city: "${city}"`);
          
          const normalized = {
            _id: vehicle._id || vehicle.id,
            name: vehicle.name || "Unknown Vehicle",
            type: vehicle.type || "Car",
            price: vehicle.price || 0,
            availability: vehicle.availability || "Available",
            rating: vehicle.rating || 0,
            driverName: vehicle.driverName || "",
            driverId: vehicle.driverId || "",
            fuelType: vehicle.fuelType || "Petrol",
            seatingCapacity: vehicle.seatingCapacity || 4,
            registrationPlate: vehicle.registrationPlate || "N/A",
            vehicleId: vehicle.vehicleId || "N/A",
            city: city,
            image: vehicle.image || "Images/default-car.png",
            withDriver: hasDriver
          };
          console.log("Normalized vehicle:", normalized);
          return normalized;
        });
        
        console.log("All normalized vehicles:", normalizedVehicles);
        setVehicles(normalizedVehicles);
      } catch (err) {
        console.error("Error fetching vehicles:", err);
        setError(err.message || "Failed to fetch vehicles");
      } finally {
        setLoading(false);
      }
    };
    
    fetchVehicles();
  }, [bookingType, withDriver, bookingData, selectedCity]);

  // Apply filtering when filter or vehicles change
  useEffect(() => {
    let updatedVehicles = [...vehicles];
    
    console.log("Starting filtering process with vehicles:", updatedVehicles);
    
    // Log city information for debugging
    if (selectedCity && selectedCity.trim() !== "") {
      console.log("Selected city (already filtered by API):", selectedCity);
      
      // Log all unique cities in the vehicles array
      const uniqueCities = [...new Set(updatedVehicles.map(v => v.city))];
      console.log("Available cities in vehicles:", uniqueCities);
    }
    
    // Then filter by driver preference
    if (withDriver) {
      // If booking type is "driver", only show vehicles with drivers
      console.log("Filtering for vehicles with drivers");
      updatedVehicles = updatedVehicles.filter(v => v.withDriver === true);
      console.log("Vehicles after driver filter (with driver):", updatedVehicles);
    } else {
      // If booking type is "own", only show vehicles without drivers
      console.log("Filtering for vehicles without drivers");
      updatedVehicles = updatedVehicles.filter(v => v.withDriver === false);
      console.log("Vehicles after driver filter (without driver):", updatedVehicles);
    }
    
    // Then apply other filters
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
    
    console.log("Final filtered vehicles:", updatedVehicles);
    setFilteredVehicles(updatedVehicles);
  }, [filter, vehicles, withDriver, selectedCity]);

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
      
      {loading && <p className="loading">Loading vehicles...</p>}
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

export default FixedVehicleFetcher;
