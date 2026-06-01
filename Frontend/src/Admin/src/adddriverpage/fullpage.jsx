import "./adddriver.css";
import React, { useEffect, useState } from "react";
import { useNavigate, Routes, Route } from "react-router-dom";
import DriverCard from "./drivercard";
import AddDriver from "../adddriverdetails/adddriver";
import useDriverStore from "../../../../store/driverStore"; // Import the driver store
// import useAdminAuthStore from "../../../../store/AdminAuthStore";

function Admindriverpage() {
  const navigate = useNavigate();
  // const { isAuthenticated, checkAuth } = useAdminAuthStore();

  // Zustand store actions and state
  const { drivers, fetchDrivers, addDriver, updateDriver, removeDriver, loading, error } = useDriverStore();

  const [editingDriver, setEditingDriver] = useState(null);
  const [authError, setAuthError] = useState(null);

  // Check authentication on component mount
  // useEffect(() => {
  //   const isAdminAuthenticated = checkAuth();
  //   if (!isAdminAuthenticated) {
  //     navigate("/auth/adminsignin");
  //   }
  // }, [checkAuth, navigate]);

  // Fetch drivers from the backend on component mount
  useEffect(() => {

      fetchDrivers().catch(err => {
        if (err.response?.status === 401) {
          setAuthError("Authentication required. Please sign in again.");
          navigate("/auth/adminsignin");
        }
      });
  }, [ fetchDrivers, navigate]);

  const handleAddDriver = () => {
    setEditingDriver(null);
    navigate("/admin/drivers/add");
  };

  const handleNewDriver = async (driverData) => {
    try {
      if (editingDriver) {
        // Update existing driver
        console.log("Editing driver with ID:", editingDriver._id);
        console.log("Driver data to update:", driverData);
        await updateDriver(editingDriver._id, driverData);
      } else {
        // Add new driver
        await addDriver(driverData);
      }
      // Refresh the drivers list
      await fetchDrivers();
      navigate("/admin/drivers");
    } catch (error) {
      console.error("Error handling driver:", error);
      if (error.response?.status === 401) {
        setAuthError("Authentication required. Please sign in again.");
        navigate("/auth/adminsignin");
      } else {
        alert("Failed to save driver. Please try again.");
      }
    }
  };

  const handleEditDriver = (driver) => {
    setEditingDriver(driver);
    navigate("/admin/drivers/add");
  };

  const handleDeleteDriver = async (driverId) => {
    if (window.confirm("Are you sure you want to delete this driver?")) {
      try {
        await removeDriver(driverId);
        // Refresh the drivers list
        await fetchDrivers();
      } catch (error) {
        console.error("Error deleting driver:", error);
        if (error.response?.status === 401) {
          setAuthError("Authentication required. Please sign in again.");
          navigate("/auth/adminsignin");
        } else {
          alert("Failed to delete driver. Please try again.");
        }
      }
    }
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          <div className="driver-container">
            {loading && (
              <div className="loading-screen">
                <div className="loading-spinner"></div>
                <p className="loading-text">Loading drivers...</p>
              </div>
            )}
            {error && <p className="error_message">{error}</p>}
            {authError && <p className="auth-error">{authError}</p>}
            {drivers.length === 0 && !loading && !error && (
              <p className="no-drivers">No drivers found. Add a new driver to get started.</p>
            )}
            {drivers.map((driver) => (
              <DriverCard
                key={driver._id}
                {...driver}
                onEdit={() => handleEditDriver(driver)}
                onDelete={() => handleDeleteDriver(driver._id)}
              />
            ))}
            <DriverCard isAddCard={true} onAdd={handleAddDriver} />
          </div>
        }
      />
      <Route
        path="add"
        element={
          <AddDriver
            onAddDriver={handleNewDriver}
            editingDriver={editingDriver}
          />
        }
      />
    </Routes>
  );
}

export default Admindriverpage;