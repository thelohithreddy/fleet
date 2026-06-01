import "./adminvehicle.css";
import React, { useEffect, useState } from "react";
import { useNavigate, Routes, Route } from "react-router-dom";
import Filter from "./filter";
import VehicleCard from "./vehiclecard";
import AddCar from "./addcar";
import useVehicleStore from "../../../../store/vehicleStore";

function Admincarspage() {
  const navigate = useNavigate();
  const { vehicles, fetchVehicles, addVehicle, updateVehicle, removeVehicle, loading, error } = useVehicleStore();
  // const { isAuthenticated, checkAuth } = useAdminAuthStore();
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [filters, setFilters] = useState({
    availability: [],
    type: [],
    city: [],
    sortBy: null
  });
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [authError, setAuthError] = useState(null);

  // // Check authentication on component mount
  // useEffect(() => {
  //   const isAdminAuthenticated = checkAuth();
  //   if (!isAdminAuthenticated) {
  //     navigate("/auth/adminsignin");
  //   }
  // }, [checkAuth, navigate]);

  // Fetch vehicles from the backend on component mount
  useEffect(() => {
  
      fetchVehicles().catch(err => {
        if (err.response?.status === 401) {
          setAuthError("Authentication required. Please sign in again.");
          navigate("/auth/adminsignin");
        }
      });

  }, [ fetchVehicles, navigate]);

  // Apply filtering & sorting logic
  useEffect(() => {
    let updatedVehicles = [...vehicles];
    console.log("Current filters:", filters);
    console.log("Vehicles before filtering:", updatedVehicles);

    // Apply availability filters
    if (filters.availability.length > 0) {
      updatedVehicles = updatedVehicles.filter(vehicle => 
        filters.availability.includes(vehicle.availability)
      );
    }

    // Apply type filters
    if (filters.type.length > 0) {
      console.log("Applying type filters:", filters.type);
      updatedVehicles = updatedVehicles.filter(vehicle => {
        const vehicleType = vehicle.type?.toLowerCase() || '';
        const matches = filters.type.some(filterType => 
          vehicleType.includes(filterType.toLowerCase())
        );
        console.log(`Vehicle ${vehicle.name} type: ${vehicleType}, matches: ${matches}`);
        return matches;
      });
    }

    // Apply city filters
    if (filters.city.length > 0) {
      updatedVehicles = updatedVehicles.filter(vehicle => 
        filters.city.includes(vehicle.city.toLowerCase())
      );
    }

    // Apply sorting
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case "Price":
          updatedVehicles.sort((a, b) => Number(a.price) - Number(b.price));
          break;
        case "Rating":
          updatedVehicles.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
          break;
        default:
          break;
      }
    }

    console.log("Vehicles after filtering:", updatedVehicles);
    setFilteredVehicles(updatedVehicles);
  }, [filters, vehicles]);

  const handleAddVehicle = () => {
    setEditingVehicle(null);
    navigate("add");
  };

  const handleNewVehicle = async (newVehicle) => {
    try {
      console.log("Handling new vehicle:", newVehicle);
      if (editingVehicle) {
        // Update existing vehicle
        console.log("Updating existing vehicle with ID:", editingVehicle._id);
        const updatedVehicle = await updateVehicle(editingVehicle._id, newVehicle);
        console.log("Vehicle updated successfully:", updatedVehicle);
      } else {
        // Add new vehicle
        console.log("Adding new vehicle");
        const addedVehicle = await addVehicle(newVehicle);
        console.log("Vehicle added successfully:", addedVehicle);
      }
      // Refresh the vehicles list
      console.log("Refreshing vehicles list");
      const refreshedVehicles = await fetchVehicles();
      console.log("Vehicles refreshed:", refreshedVehicles);
      navigate("/admin/vehicles");
    } catch (error) {
      console.error("Error handling vehicle:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      if (error.response?.status === 401) {
        setAuthError("Authentication required. Please sign in again.");
        navigate("/auth/adminsignin");
      } else {
        alert("Failed to save vehicle. Please try again.");
      }
    }
  };

  const handleEditVehicle = (vehicle) => {
    setEditingVehicle(vehicle);
    navigate("add");
  };

  const handleDeleteVehicle = async (vehicle) => {
    if (window.confirm("Are you sure you want to delete this vehicle?")) {
      try {
        await removeVehicle(vehicle._id);
        // Refresh the vehicles list
        await fetchVehicles();
      } catch (error) {
        console.error("Error deleting vehicle:", error);
        if (error.response?.status === 401) {
          setAuthError("Authentication required. Please sign in again.");
          navigate("/auth/adminsignin");
        } else {
          alert("Failed to delete vehicle. Please try again.");
        }
      }
    }
  };

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

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <div className="main">
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
              {authError && <p className="auth-error">{authError}</p>}
              <div className="card-container">
                {filteredVehicles.map((vehicle, index) => (
                  <VehicleCard
                    key={vehicle._id || index}
                    vehicle={vehicle}
                    onEdit={handleEditVehicle}
                    onDelete={handleDeleteVehicle}
                  />
                ))}
                <div className="add-card" onClick={handleAddVehicle}>
                  <h2>+ Add Vehicle</h2>
                </div>
              </div>
            </div>
          }
        />
        <Route
          path="add"
          element={
            <AddCar
              onAddVehicle={handleNewVehicle}
              editingVehicle={editingVehicle}
            />
          }
        />
      </Routes>
    </>
  );
}

export default Admincarspage;