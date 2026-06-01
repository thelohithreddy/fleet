import "../Admin/src/adminvehiclepage/adminvehicle.css";
import React, { useState } from "react";

const Filter = ({ onFilterChange, onSortChange, activeFilters }) => {
  const [isOpen, setIsOpen] = useState({
    availability: false,
    type: false,
    seating: false,
    sort: false
  });

  const toggleDropdown = (category) => {
    setIsOpen(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const handleCheckboxChange = (category, value) => (e) => {
    onFilterChange(category, value, e.target.checked);
  };

  return (
    <div className="filter-container">
      {/*<div className="filter-group">
        <div className="filter-header" onClick={() => toggleDropdown('availability')}>
          <h3>Availability</h3>
          <span className={`dropdown-arrow ${isOpen.availability ? 'open' : ''}`}>▼</span>
        </div>
        {isOpen.availability && (
          <div className="filter-options">
            {["Available", "Not Available"].map((option) => (
              <label key={option} className="filter-option">
                <input
                  type="checkbox"
                  checked={activeFilters.availability.includes(option)}
                  onChange={handleCheckboxChange("availability", option)}
                />
                <span className="checkbox-label">{option}</span>
              </label>
            ))}
          </div>
        )}
      </div>*/}

      <div className="filter-group">
        <div className="filter-header" onClick={() => toggleDropdown('type')}>
          <h3>Vehicle Type</h3>
          <span className={`dropdown-arrow ${isOpen.type ? 'open' : ''}`}>▼</span>
        </div>
        {isOpen.type && (
          <div className="filter-options">
            {["Car", "Bike", "Truck", "Van"].map((option) => (
              <label key={option} className="filter-option">
                <input
                  type="checkbox"
                  checked={activeFilters.type.includes(option.toLowerCase())}
                  onChange={handleCheckboxChange("type", option.toLowerCase())}
                />
                <span className="checkbox-label">{option}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="filter-group">
        <div className="filter-header" onClick={() => toggleDropdown('seating')}>
          <h3>Seating Capacity</h3>
          <span className={`dropdown-arrow ${isOpen.seating ? 'open' : ''}`}>▼</span>
        </div>
        {isOpen.seating && (
          <div className="filter-options">
            {[
              { value: "1", label: "1 Seat" },
              { value: "2-4", label: "2-4 Seats" },
              { value: "5-7", label: "5-7 Seats" },
              { value: "8+", label: "8+ Seats" }
            ].map((option) => (
              <label key={option.value} className="filter-option">
                <input
                  type="checkbox"
                  checked={activeFilters.seating.includes(option.value)}
                  onChange={handleCheckboxChange("seating", option.value)}
                />
                <span className="checkbox-label">{option.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="filter-group">
        <div className="filter-header" onClick={() => toggleDropdown('sort')}>
          <h3>Sort By</h3>
          <span className={`dropdown-arrow ${isOpen.sort ? 'open' : ''}`}>▼</span>
        </div>
        {isOpen.sort && (
          <div className="filter-options">
            {[
              { value: "Price", label: "Price: Low to High" },
              { value: "Rating", label: "Rating: High to Low" }
            ].map((option) => (
              <label key={option.value} className="filter-option">
                <input
                  type="checkbox"
                  checked={activeFilters.sortBy === option.value}
                  onChange={(e) => {
                    if (e.target.checked) {
                      onSortChange(option.value);
                    }
                  }}
                />
                <span className="checkbox-label">{option.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Filter;
