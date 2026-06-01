import React, { useState, useEffect } from "react";
import logo from "../greylogo.png";
import "./nav.css";
import { useNavigate } from "react-router-dom"; 
function Nav() {
  const navigate = useNavigate(); 
 
  return (
    <nav className="navbar">
      <div className="logo-section">
        <img className="greylogo" src={logo} alt="Logo"
        onClick={() => navigate("/")} // Navigate to home when clicked
        style={{ cursor: "pointer" }} />
      </div>
      <div className="profile-icon">
        <span>A</span>
      </div>
    </nav>
  );
}

export default Nav;
