import "./adminvehicle.css";
import React, { useState } from "react";

const Filter = ({ onFilterChange, onSortChange, activeFilters }) => {
  const [isOpen, setIsOpen] = useState({
    availability: false,
    type: false,
    city: false,
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
      <div className="filter-group">
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
      </div>

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
        <div className="filter-header" onClick={() => toggleDropdown('city')}>
          <h3>City</h3>
          <span className={`dropdown-arrow ${isOpen.city ? 'open' : ''}`}>▼</span>
        </div>
        {isOpen.city && (
          <div className="filter-options">
            {["Delhi", "Lucknow", "Kanpur"].map((option) => (
              <label key={option} className="filter-option">
                <input
                  type="checkbox"
                  checked={activeFilters.city.includes(option.toLowerCase())}
                  onChange={handleCheckboxChange("city", option.toLowerCase())}
                />
                <span className="checkbox-label">{option}</span>
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
