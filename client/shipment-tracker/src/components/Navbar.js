// src/components/Navbar.js
import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav>
      <Link to="/">Track Shipment</Link>
      <Link to="/admin">Admin Dashboard</Link>
    </nav>
  );
};

export default Navbar;
