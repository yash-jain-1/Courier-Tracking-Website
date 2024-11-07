import React from 'react';
import ShipmentTracker from './pages/TrackShipment';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to Shanu Services</h1>
        <p>Track Your Shipment</p>
      </header>
      <ShipmentTracker />
    </div>
  );
}

export default App;
