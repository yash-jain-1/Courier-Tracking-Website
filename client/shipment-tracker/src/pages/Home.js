// Home.js
import React from 'react';
import './Home.css';
import TrackShipment from './TrackShipment';

const Home = () => {
  return (
    <div className="home-container">
      <h1 className="home-title">Welcome to SHANU SERVICES</h1>
      <h2 className="home-subtitle">Your Reliable Shipping Partner</h2>
      <p className="home-content">
        We offer global logistics solutions tailored to meet your needs. From fast shipments to
        comprehensive tracking, Bombino Express is dedicated to providing exceptional service.
      </p>
      
      {/* Track Shipment Container */}
      <div className="track-shipment-container">
        <h2 className="track-shipment-title">Track Your Shipment</h2>
        <TrackShipment />
      </div>
      
      <button className="home-button">Get Started</button>
    </div>
  );
};

export default Home;
