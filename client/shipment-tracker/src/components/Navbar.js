import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const NavBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">SHANU SERVICES</Link>
      </div>
      <button className="hamburger" onClick={toggleMenu}>
        <span className="line"></span>
        <span className="line"></span>
        <span className="line"></span>
      </button>
      <ul className={`navbar-links ${isMenuOpen ? 'active' : ''}`}>
        <li><Link to="/about">About Us</Link></li>
        <li><Link to="/admin">Admin Dashboard</Link></li>
        <li><Link to="/contact">Contact Us</Link></li>
        <li><Link to="/login">Login</Link></li>
      </ul>
    </nav>
  );
};

export default NavBar;
