import React, { useState, useEffect } from 'react';
import { fetchShipment, addShipment, updateShipment, fetchAllShipments } from '../services/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [shipmentDetails, setShipmentDetails] = useState(null);
  const [newShipment, setNewShipment] = useState({ trackingNumber: '', location: '', status: '' });
  const [updateData, setUpdateData] = useState({ date: '', time: '', location: '', status: '', remarks: '' });
  const [allShipments, setAllShipments] = useState([]);

  // Fetch shipment details
  const handleFetchShipment = async () => {
    try {
      const response = await fetchShipment(trackingNumber);
      setShipmentDetails(response.data);
    } catch (error) {
      console.error("Error fetching shipment:", error);
      alert("Shipment not found.");
    }
  };

  // Add new shipment
  const handleAddShipment = async () => {
    try {
      await addShipment(newShipment);
      alert("Shipment added successfully!");
      setNewShipment({ trackingNumber: '', location: '', status: '' });
      fetchAllShipmentsData(); // Re-fetch the list of all shipments after adding a new one
    } catch (error) {
      console.error("Error adding shipment:", error);
      alert("Failed to add shipment.");
    }
  };
  
  // Update shipment with new status and updates
  const handleUpdateShipment = async () => {
    try {
      // Prepare the data for updating the status and adding to updates
      const updatePayload = {
        status: updateData.status,  // Update the status field
        updateData: {
          date: new Date(),          // Current date
          time: new Date().toLocaleTimeString(),  // Current time
          location: updateData.location,
          activity: updateData.activity,
          remarks: updateData.remarks
        }
      };

      // Send the update request with status and updates
      await updateShipment(trackingNumber, updatePayload);

      alert("Shipment updated successfully!");

      // Clear the update data form after successful update
      setUpdateData({ location: '', activity: '', remarks: '', status: '' });
    } catch (error) {
      console.error("Error updating shipment:", error);
      alert("Failed to update shipment.");
    }
  };


  // Fetch all shipments
  const fetchAllShipmentsData = async () => {
    try {
      const response = await fetchAllShipments();
      setAllShipments(response.data);
    } catch (error) {
      console.error("Error fetching all shipments:", error);
      alert("Failed to fetch shipments.");
    }
  };

  // Fetch all shipments on initial load
  useEffect(() => {
    fetchAllShipmentsData();
  }, []);

  return (
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>

      {/* Fetch Shipment Section */}
      <div>
        <h3>Fetch Shipment</h3>
        <input
          type="text"
          placeholder="Enter Tracking Number"
          value={trackingNumber}
          onChange={(e) => setTrackingNumber(e.target.value)}
        />
        <button onClick={handleFetchShipment}>Fetch Shipment</button>

        {shipmentDetails && (
          <div>
            <h4>Shipment Details:</h4>
            <p>Tracking Number: {shipmentDetails.trackingNumber}</p>
            <p>Status: {shipmentDetails.status}</p>
            <p>Location: {shipmentDetails.location}</p>
            <p>Updates:</p>
            <ul>
              {shipmentDetails.updates.map((update, index) => (
                <li key={index}>
                  <p><strong>Date:</strong> {update.date}</p>
                  <p><strong>Time:</strong> {update.time}</p>
                  <p><strong>Location:</strong> {update.location}</p>
                  <p><strong>Activity:</strong> {update.activity}</p>
                  <p><strong>Remarks:</strong> {update.remarks}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Add New Shipment Section */}
      <div>
        <h3>Add New Shipment</h3>
        <input
          type="text"
          placeholder="Tracking Number"
          value={newShipment.trackingNumber}
          onChange={(e) => setNewShipment({ ...newShipment, trackingNumber: e.target.value })}
        />
        <input
          type="text"
          placeholder="Location"
          value={newShipment.location}
          onChange={(e) => setNewShipment({ ...newShipment, location: e.target.value })}
        />
        <input
          type="text"
          placeholder="Status"
          value={newShipment.status}
          onChange={(e) => setNewShipment({ ...newShipment, status: e.target.value })}
        />
        <button onClick={handleAddShipment}>Add Shipment</button>
      </div>

      {/* Update Shipment Section */}
      <div>
        <h3>Update Shipment</h3>
        <input
          type="text"
          placeholder="Tracking Number"
          value={trackingNumber}
          
        />
        <input
          type="date"
          value={updateData.date}
          onChange={(e) => setUpdateData({ ...updateData, date: e.target.value })}
        />
        <input
          type="text"
          placeholder="Time"
          value={updateData.time}
          onChange={(e) => setUpdateData({ ...updateData, time: e.target.value })}
        />
        <input
          type="text"
          placeholder="Location"
          value={updateData.location}
          onChange={(e) => setUpdateData({ ...updateData, location: e.target.value })}
        />
        <input
          type="text"
          placeholder="Stauts"
          value={updateData.activity}
          onChange={(e) => setUpdateData({ ...updateData, activity: e.target.value })}
        />
        <input
          type="text"
          placeholder="Remarks"
          value={updateData.remarks}
          onChange={(e) => setUpdateData({ ...updateData, remarks: e.target.value })}
        />
        <button onClick={handleUpdateShipment}>Update Shipment</button>
      </div>

      {/* List of All Shipments */}
      <div class="table-container">
        <h3>All Shipments</h3>
        <table class="admin-dashboard-table">
          <thead>
            <tr>
              <th>Tracking Number</th>
              <th>Location</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {allShipments.length === 0 ? (
              <tr>
                <td colSpan="3">No shipments found</td>
              </tr>
            ) : (
              allShipments.map((shipment) => (
                <tr key={shipment.trackingNumber}>
                  <td>{shipment.trackingNumber}</td>
                  <td>{shipment.location}</td>
                  <td>{shipment.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
