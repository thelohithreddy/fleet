import React from "react";
import { Link } from "react-router-dom";
import { SUPPORT_EMAIL, SUPPORT_PHONE, SUPPORT_PHONE_DISPLAY } from "../config/app.js";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="fleet-footer">
      <div className="fleet-footer__inner">
        <div className="fleet-footer__brand">
          <img src="/Logo.png" alt="Fleet" className="fleet-footer__logo" />
          <p>Self-drive &amp; chauffeur rentals across India.</p>
        </div>
        <div className="fleet-footer__col">
          <h4>Quick links</h4>
          <Link to="/home">Home</Link>
          <Link to="/home/vehicles">Search cars</Link>
          <Link to="/home/active">My trips</Link>
          <Link to="/home/host">Host &amp; earn</Link>
        </div>
        <div className="fleet-footer__col">
          <h4>Support</h4>
          <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
          <a href={`tel:${SUPPORT_PHONE}`}>{SUPPORT_PHONE_DISPLAY}</a>
        </div>
        <div className="fleet-footer__col">
          <h4>Offers</h4>
          <span className="fleet-footer__offer">WELCOME20 — 20% off first ride</span>
          <span className="fleet-footer__offer">7+ day trips — up to 15% off</span>
        </div>
      </div>
      <div className="fleet-footer__bottom">
        <span>© {new Date().getFullYear()} Fleet. All rights reserved.</span>
      </div>
    </footer>
  );
}
