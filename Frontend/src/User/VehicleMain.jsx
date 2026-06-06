import "./Vehicle.css";
import React, { useState, useEffect, useMemo } from "react";
import { useLocation, Routes, Route, useNavigate } from "react-router-dom";
import Filter from "./Filter";
import VehicleCard from "./VehicleCard";
import useUserVehicleStore from "../../store/userVehicleStore";
import useBookingStore from "../../store/BookingStore";
import { LONG_TRIP_DAYS } from "../config/app.js";

function getEmptyMessage(meta, withDriver, city, filteredCount) {
  if (!meta || !city) {
    return {
      title: "No vehicles found",
      detail: "Try changing your search filters or dates.",
    };
  }

  if (meta.totalInCity === 0) {
    return {
      title: `No cars found in ${city}`,
      detail: "We don't have fleet coverage in this city yet. Try a nearby city or list your car as a host.",
    };
  }

  if (withDriver && meta.withDriverInCity === 0) {
    return {
      title: `No driver available in ${city}`,
      detail: "Chauffeur cars aren't available here yet. Switch to self-drive or pick another city.",
    };
  }

  if (!withDriver && meta.selfDriveInCity === 0) {
    return {
      title: `No self-drive cars in ${city}`,
      detail: "Only chauffeur options exist in this city. Try 'With driver' or another city.",
    };
  }

  if (filteredCount === 0) {
    return {
      title: "All cars booked for these dates",
      detail: "Every matching vehicle is reserved. Try different dates or relax your filters.",
    };
  }

  return {
    title: "No vehicles found",
    detail: "Adjust filters or search again from home.",
  };
}

function Usercarspage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { vehicles, searchMeta, searchVehicles, loading, error } = useUserVehicleStore();
  const { bookingData } = useBookingStore();

  const [filters, setFilters] = useState({
    availability: [],
    type: [],
    seating: [],
    sortBy: "Price",
  });

  const withDriver = bookingData.withDriver ?? false;
  const city = bookingData.city || location.state?.city || "";
  const duration = bookingData.duration || 1;
  const isLongTrip = duration >= LONG_TRIP_DAYS;

  const [searchParams, setSearchParams] = useState({
    city,
    pickupDate: new Date(`${bookingData.pickupDate}T${bookingData.pickupTime}:00.000Z`),
    returnDate: new Date(`${bookingData.returnDate}T${bookingData.returnTime}:00.000Z`),
    withDriver,
  });

  useEffect(() => {
    setSearchParams({
      city: bookingData.city || "",
      pickupDate: new Date(`${bookingData.pickupDate}T${bookingData.pickupTime}:00.000Z`),
      returnDate: new Date(`${bookingData.returnDate}T${bookingData.returnTime}:00.000Z`),
      withDriver: bookingData.withDriver,
    });
  }, [bookingData]);

  useEffect(() => {
    const fetchVehicles = async () => {
      if (!searchParams.city) return;
      try {
        await searchVehicles(searchParams);
      } catch (err) {
        console.error("Error fetching vehicles:", err);
      }
    };
    fetchVehicles();
  }, [searchParams, searchVehicles]);

  const handleFilterChange = (category, value, isChecked) => {
    setFilters((prev) => {
      const next = { ...prev };
      if (isChecked) {
        if (!next[category].includes(value)) {
          next[category] = [...next[category], value];
        }
      } else {
        next[category] = next[category].filter((item) => item !== value);
      }
      return next;
    });
  };

  const handleSortChange = (sortOption) => {
    setFilters((prev) => ({ ...prev, sortBy: sortOption }));
  };

  const filteredVehicles = useMemo(() => {
    let filtered = [...vehicles];

    if (filters.availability.length > 0) {
      filtered = filtered.filter((v) => filters.availability.includes(v.availability));
    }
    if (filters.type.length > 0) {
      filtered = filtered.filter((v) => filters.type.includes(v.type.toLowerCase()));
    }
    if (filters.seating.length > 0) {
      filtered = filtered.filter((vehicle) => {
        const seats = parseInt(vehicle.seatingCapacity, 10);
        return filters.seating.some((range) => {
          switch (range) {
            case "1": return seats === 1;
            case "2-4": return seats >= 2 && seats <= 4;
            case "5-7": return seats >= 5 && seats <= 7;
            case "8+": return seats >= 8;
            default: return false;
          }
        });
      });
    }

    if (filters.sortBy === "Price") {
      filtered.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (filters.sortBy === "Rating") {
      filtered.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
    }

    return filtered;
  }, [vehicles, filters]);

  const suggestedVehicles = useMemo(() => {
    if (!isLongTrip || filteredVehicles.length === 0) return [];
    return [...filteredVehicles]
      .sort((a, b) => {
        const scoreA = parseFloat(a.rating) * 10 - Number(a.price) / 100;
        const scoreB = parseFloat(b.rating) * 10 - Number(b.price) / 100;
        return scoreB - scoreA;
      })
      .slice(0, 3);
  }, [filteredVehicles, isLongTrip]);

  const emptyMsg = getEmptyMessage(searchMeta, withDriver, city, filteredVehicles.length);

  return (
    <Routes>
      <Route
        path="/*"
        element={
          <div className="main_v">
            <div className="vehicles-page-header">
              <h1>Cars in {city || "your city"}</h1>
              <p>
                {withDriver ? "With chauffeur" : "Self drive"} · {duration} day{duration !== 1 ? "s" : ""}
                {isLongTrip && <span className="vehicles-long-badge"> Long-trip savings applied</span>}
              </p>
            </div>

            {isLongTrip && suggestedVehicles.length > 0 && (
              <section className="vehicles-suggested">
                <h2>Recommended for {duration}+ day trips</h2>
                <div className="vehicles-suggested__row">
                  {suggestedVehicles.map((v) => (
                    <div key={`sug-${v._id}`} className="vehicles-suggested__chip">
                      {v.name} — ₹{v.price}/day · ⭐ {v.rating}
                    </div>
                  ))}
                </div>
              </section>
            )}

            <Filter
              onFilterChange={handleFilterChange}
              onSortChange={handleSortChange}
              activeFilters={filters}
            />

            {loading && (
              <div className="loading-screen">
                <div className="loading-spinner" />
                <p className="loading-text">Searching {city}…</p>
              </div>
            )}

            {error && (
              <div className="vehicles-empty-state">
                <p className="vehicles-empty-state__title">Something went wrong</p>
                <p>{error}</p>
              </div>
            )}

            <div className="card-container_v">
              {!loading && !error && filteredVehicles.length === 0 && (
                <div className="vehicles-empty-state">
                  <div className="vehicles-empty-state__icon">
                    {withDriver && searchMeta?.withDriverInCity === 0 ? "👤" : "🚗"}
                  </div>
                  <p className="vehicles-empty-state__title">{emptyMsg.title}</p>
                  <p className="vehicles-empty-state__detail">{emptyMsg.detail}</p>
                  <div className="vehicles-empty-state__actions">
                    <button type="button" className="fleet-btn fleet-btn--primary" onClick={() => navigate("/home")}>
                      Change search
                    </button>
                    {searchMeta?.totalInCity === 0 && (
                      <button type="button" className="fleet-btn fleet-btn--outline" onClick={() => navigate("/home/host")}>
                        List your car here
                      </button>
                    )}
                  </div>
                </div>
              )}

              {filteredVehicles.map((vehicle) => (
                <VehicleCard
                  key={vehicle._id}
                  vehicle={vehicle}
                  bookingType={searchParams.withDriver}
                  tripDuration={duration}
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
