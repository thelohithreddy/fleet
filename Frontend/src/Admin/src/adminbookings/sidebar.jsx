import React from "react";
import "./sidebar.css";
import Calendar from "./calendar";
function Adminbookingssidebar() {
  return (
    <div className="sidebar">
      <div className="logo"></div>
      <Calendar />
      <div className="filters">
        <button className="filter-btn">Today</button>
        <button className="filter-btn">Tomorrow</button>
        <button className="filter-btn">Yesterday</button>
      </div>
    </div>
  );
}

export default Adminbookingssidebar;
