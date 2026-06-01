import "./Vehicle.css";
import React, { useState, useEffect } from "react";
import { useLocation, Routes, Route } from "react-router-dom";
import Filter from "./Filter";
import { useNavigate } from "react-router-dom";
import VehicleCard from "./VehicleCard";
import useUserVehicleStore from "../../store/userVehicleStore"; // Import the UserVehicleStore
import useBookingStore from "../../store/BookingStore"; // Import the BookingStore

function Usercarspage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { vehicles, searchVehicles, loading, error } = useUserVehicleStore(); // Access the user vehicle store
  const { bookingData } = useBookingStore(); // Access the booking data from BookingStore

  const [filters, setFilters] = useState({
    availability: [],
    type: [],
    seating: [],
    sortBy: "Price"
  });

  // Initialize search parameters from BookingStore
  const [searchParams, setSearchParams] = useState({
    city: bookingData.city || location.state?.city || "",
    pickupDate: new Date(`${bookingData.pickupDate}T${bookingData.pickupTime}:00.000Z`), // Combine date and time
    returnDate: new Date(`${bookingData.returnDate}T${bookingData.returnTime}:00.000Z`),
    withDriver: bookingData.withDriver,
  });

  // Fetch vehicles when the component mounts or search parameters change
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        await searchVehicles(searchParams);
      } catch (err) {
        console.error("Error fetching vehicles:", err);
      }
    };
    fetchVehicles();
  }, [searchParams, searchVehicles]);

  const handleFilterChange = (category, value, isChecked) => {
    setFilters(prevFilters => {
      const newFilters = { ...prevFilters };
      
      if (isChecked) {
        // Add filter
        if (!newFilters[category].includes(value)) {
          newFilters[category] = [...newFilters[category], value];
        }
      } else {
        // Remove filter
        newFilters[category] = newFilters[category].filter(item => item !== value);
      }
      
      return newFilters;
    });
  };

  const handleSortChange = (sortOption) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      sortBy: sortOption
    }));
  };

  // Apply client-side filtering based on the selected filters
  const filteredVehicles = React.useMemo(() => {
    let filtered = [...vehicles];

    // Apply availability filters
    if (filters.availability.length > 0) {
      filtered = filtered.filter(vehicle => 
        filters.availability.includes(vehicle.availability)
      );
    }

    // Apply type filters
    if (filters.type.length > 0) {
      filtered = filtered.filter(vehicle => 
        filters.type.includes(vehicle.type.toLowerCase())
      );
    }

    // Apply seating capacity filters
    if (filters.seating.length > 0) {
      filtered = filtered.filter(vehicle => {
        const vehicleSeats = parseInt(vehicle.seatingCapacity);
        return filters.seating.some(selectedRange => {
          switch (selectedRange) {
            case "1":
              return vehicleSeats === 1;
            case "2-4":
              return vehicleSeats >= 2 && vehicleSeats <= 4;
            case "5-7":
              return vehicleSeats >= 5 && vehicleSeats <= 7;
            case "8+":
              return vehicleSeats >= 8;
            default:
              return false;
          }
        });
      });
    }

    // Apply sorting
    if (filters.sortBy === "Price") {
      filtered.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (filters.sortBy === "Rating") {
      filtered.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
    }

    return filtered;
  }, [vehicles, filters]);

  return (
    <Routes>
      <Route
        path="/*"
        element={
          <div className="main_v">
            <Filter 
              onFilterChange={handleFilterChange}
              onSortChange={handleSortChange}
              activeFilters={filters}
            />
            {loading && (
              <div className="loading-screen">
                <div className="loading-spinner"></div>
                <p className="loading-text">Loading vehicles...</p>
              </div>
            )}
            {error && <p className="error">Error: {error}</p>}
            <div className="card-container_v">
              {filteredVehicles.length === 0 && !loading && !error && (
                <div className="parent1">
                  <p className="no-vehicles">No vehicles found matching your criteria.</p>
                  <button className="back-link" onClick={() => navigate('/home')}>Back to Home</button>
                </div>
              )}
              {filteredVehicles.map((vehicle) => (
                <VehicleCard
                  key={vehicle._id}
                  vehicle={vehicle}
                  bookingType={searchParams.withDriver}
                />
              ))}
            </div>
          </div>
        }
      />
    </Routes>
  );
}

export default Usercarspage;
