import React, { useState, useRef, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import "./NavBar.css";
import useAuthStore from "../../store/AuthStore.js";
import useAdminAuthStore from "../../store/AdminAuthStore.js";
import { SUPPORT_EMAIL, SUPPORT_PHONE, SUPPORT_PHONE_DISPLAY } from "../config/app.js";
import { jwtDecode } from "jwt-decode";

const NavBar = ({ isAdmin }) => {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const { userlogout, token } = useAuthStore();
  const { adminlogout } = useAdminAuthStore();

  const isBookingPage =
    location.pathname.includes("/home/active") ||
    location.pathname.includes("/home/past");

  let userEmail = "";
  if (token) {
    try {
      const decoded = jwtDecode(token);
      userEmail = decoded.email || "";
    } catch {
      userEmail = "";
    }
  }

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setMenuOpen(false);
    if (isAdmin) adminlogout();
    else userlogout();
  };

  return (
    <header className="header_nav">
      <NavLink to={isAdmin ? "/admin" : "/home"}>
        <div className="logo_nav">
          <img src="/Logo.png" alt="Fleet" />
        </div>
      </NavLink>

      <nav className="links_nav">
        {!isAdmin ? (
          <>
            <NavLink
              to="/home"
              className={({ isActive }) =>
                `nav-link-btn${isActive && location.pathname === "/home" ? " active" : ""}`
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/home/active"
              className={`nav-link-btn ${isBookingPage ? "active" : ""}`}
            >
              My trips
            </NavLink>
            <NavLink
              to="/home/host"
              className={({ isActive }) =>
                `nav-link-btn nav-link-btn--host${isActive ? " active" : ""}`
              }
            >
              Host &amp; earn
            </NavLink>
            <a
              href={`mailto:${SUPPORT_EMAIL}?subject=Fleet%20Support`}
              className="nav-link-btn"
            >
              Help
            </a>
            <a href={`tel:${SUPPORT_PHONE}`} className="nav-link-btn nav-link-btn--phone">
              {SUPPORT_PHONE_DISPLAY}
            </a>

            <div className="nav-profile-menu" ref={menuRef}>
              <button
                type="button"
                className={`profile_nav ${menuOpen ? "profile_nav--open" : ""}`}
                onClick={() => setMenuOpen((o) => !o)}
                aria-expanded={menuOpen}
                aria-haspopup="true"
              >
                👤
              </button>
              {menuOpen && (
                <div className="nav-dropdown">
                  <div className="nav-dropdown__header">
                    <span className="nav-dropdown__label">Signed in as</span>
                    <span className="nav-dropdown__email">{userEmail || "User"}</span>
                  </div>
                  <NavLink
                    to="/home/profile"
                    className="nav-dropdown__item"
                    onClick={() => setMenuOpen(false)}
                  >
                    My profile
                  </NavLink>
                  <NavLink
                    to="/home/host"
                    className="nav-dropdown__item"
                    onClick={() => setMenuOpen(false)}
                  >
                    List your car
                  </NavLink>
                  <a
                    href={`mailto:${SUPPORT_EMAIL}`}
                    className="nav-dropdown__item"
                    onClick={() => setMenuOpen(false)}
                  >
                    Email support
                  </a>
                  <a
                    href={`tel:${SUPPORT_PHONE}`}
                    className="nav-dropdown__item"
                    onClick={() => setMenuOpen(false)}
                  >
                    Call {SUPPORT_PHONE_DISPLAY}
                  </a>
                  <div className="nav-dropdown__divider" />
                  <button
                    type="button"
                    className="nav-dropdown__item nav-dropdown__item--logout"
                    onClick={handleLogout}
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <button
            type="button"
            className="nav-link-btn nav-link-btn--primary"
            onClick={handleLogout}
          >
            Logout
          </button>
        )}
      </nav>
    </header>
  );
};

export default NavBar;
