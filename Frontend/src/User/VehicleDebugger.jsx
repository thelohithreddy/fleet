import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Vehicle.css";
import useBookingStore from "../../store/BookingStore";

function VehicleDebugger() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Get booking data from the store
  const { bookingData } = useBookingStore();
  const selectedCity = bookingData.city;

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Make direct API call to vehicles endpoint
        console.log("Making API call to fetch vehicles for debugging...");
        
        // Use the correct endpoint format based on axios configuration
        const response = await axios.get("/admin/vehicles");
        
        console.log("Raw API response:", response);
        console.log("API response data:", response.data);
        console.log("Selected city:", selectedCity);
        console.log("Hello")
        
        // Handle different response structures
        let vehiclesData = [];
        
        if (response.data.success && response.data.vehicles) {
          vehiclesData = response.data.vehicles;
        } else if (Array.isArray(response.data)) {
          vehiclesData = response.data;
        } else if (response.data.vehicles && Array.isArray(response.data.vehicles)) {
          vehiclesData = response.data.vehicles;
        } else {
          console.error("Unexpected response structure:", response.data);
          setError("Unexpected response structure from server");
          return;
        }
        
        console.log("Extracted vehicles data:", vehiclesData);
        setVehicles(vehiclesData);
      } catch (err) {
        console.error("Error fetching vehicles:", err);
        setError(err.message || "Failed to fetch vehicles");
      } finally {
        setLoading(false);
      }
    };
    
    fetchVehicles();
  }, [selectedCity]);

  // Count vehicles by city
  const vehiclesByCity = vehicles.reduce((acc, vehicle) => {
    const city = vehicle.city || "Unknown";
    acc[city] = (acc[city] || 0) + 1;
    return acc;
  }, {});

  // Count vehicles with and without drivers
  const vehiclesWithDriver = vehicles.filter(v => v.driverName && v.driverName.trim() !== "").length;
  const vehiclesWithoutDriver = vehicles.filter(v => !v.driverName || v.driverName.trim() === "").length;

  // Vehicles are already filtered by city in the API call
  const cityFilteredVehicles = vehicles;

  // Log all unique cities for debugging
  const uniqueCities = [...new Set(vehicles.map(v => v.city))];
  console.log("All unique cities in vehicles:", uniqueCities);
  console.log("Selected city:", selectedCity);
  console.log("City comparison:", uniqueCities.map(city => ({
    city,
    matches: city && selectedCity && city.toLowerCase() === selectedCity.toLowerCase()
  })));

  return (
    <div className="debug-container">
      <h2>Vehicle Debugger</h2>
      <p>This component shows all vehicles and their driver information.</p>
      
      {loading && <p className="loading">Loading vehicles...</p>}
      {error && <p className="error">Error: {error}</p>}
      
      <div className="debug-stats">
        <p>Total vehicles: {vehicles.length}</p>
        <p>Vehicles with drivers: {vehiclesWithDriver}</p>
        <p>Vehicles without drivers: {vehiclesWithoutDriver}</p>
        <p>Selected city: {selectedCity || "None"}</p>
        <p>Vehicles in selected city: {cityFilteredVehicles.length}</p>
        <p>All unique cities: {uniqueCities.join(", ")}</p>
      </div>
      
      <h3>Vehicles by City</h3>
      <div className="debug-stats">
        {Object.entries(vehiclesByCity).map(([city, count]) => (
          <p key={city}>{city}: {count}</p>
        ))}
      </div>
      
      <table className="debug-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Type</th>
            <th>Availability</th>
            <th>Driver Name</th>
            <th>Driver ID</th>
            <th>City</th>
          </tr>
        </thead>
        <tbody>
          {vehicles.map(vehicle => (
            <tr key={vehicle._id || vehicle.id}>
              <td>{vehicle._id || vehicle.id}</td>
              <td>{vehicle.name}</td>
              <td>{vehicle.type}</td>
              <td>{vehicle.availability}</td>
              <td>{vehicle.driverName || "No driver"}</td>
              <td>{vehicle.driverId || "No driver ID"}</td>
              <td>{vehicle.city}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default VehicleDebugger;
