import React from "react";
import { Outlet } from "react-router-dom";
import "./App.css";
import Nav from "./navbar/nav.jsx";

function Appadmin() {
  return (
    <>
      <Nav />
      <Outlet />
    </>
  );
}

export default Appadmin;
