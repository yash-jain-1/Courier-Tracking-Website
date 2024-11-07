import React, { useState } from 'react';
import axios from 'axios';

const ShipmentTracker = () => {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [shipmentData, setShipmentData] = useState(null);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    setTrackingNumber(e.target.value);
  };

  const handleSearch = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/api/shipments/${trackingNumber}`);
      setShipmentData(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching shipment:', err);  // Log the full error
      setError('Shipment not found');
      setShipmentData(null);
    }
  };
  

  return (
    <div className="shipment-tracker">
      <h2>Track Your Shipment</h2>
      <input
        type="text"
        value={trackingNumber}
        onChange={handleInputChange}
        placeholder="Enter Your Tracking No..."
      />
      <button onClick={handleSearch}>Search</button>

      {error && <p className="error">{error}</p>}
      {shipmentData && (
        <div className="shipment-details">
          <h3>Status: {shipmentData.status}</h3>
          <p>Current Location: {shipmentData.location}</p>
          <h4>Updates:</h4>
          <ul>
            {shipmentData.updates.map((update) => (
              <li key={update._id}>
                <p>Date: {new Date(update.date).toLocaleDateString()}</p>
                <p>Time: {update.time}</p>
                <p>Location: {update.location}</p>
                <p>Activity: {update.activity}</p>
                <p>Remarks: {update.remarks}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ShipmentTracker;
