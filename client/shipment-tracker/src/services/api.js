// src/services/api.js
import axios from 'axios';

const API_URL = 'http://localhost:3001/api'; // Your backend URL

// Fetch shipment details
export const fetchShipment = (trackingNumber) => {
  return axios.get(`${API_URL}/shipments/${trackingNumber}`);
};

// Admin login
export const adminLogin = (credentials) => {
  return axios.post(`${API_URL}/admin/login`, credentials);
};

// Add a new shipment
export const addShipment = (shipmentData) => {
  return axios.post(`${API_URL}/admin/shipments`, shipmentData);
};

// Update shipment
export const updateShipment = (trackingNumber, updateData) => {
  return axios.post(`${API_URL}/admin/shipments/${trackingNumber}/updates`, updateData);
};
