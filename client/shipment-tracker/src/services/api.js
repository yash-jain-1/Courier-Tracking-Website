// src/services/api.js
import axios from 'axios';

const API_URL = 'https://courier-tracking-website.onrender.com/api'; // Your backend URL
console.log("API URL:", API_URL);

// Fetch shipment details
export const fetchShipment = (trackingNumber) => {
  return axios.get(`${API_URL}/shipments/${trackingNumber}`);
};

// Admin login
export const adminLogin = (credentials) => {
  return axios.post(`${API_URL}/auth/login`, credentials);
};

// Add a new shipment
export const addShipment = (shipmentData) => axios.post(`${API_URL}/shipments`, shipmentData);

// Update shipment details (add update)
export const updateShipment = (trackingNumber, updateData) => axios.post(`${API_URL}/shipments/${trackingNumber}/updates`, updateData);

// Fetch all shipments for admin (with pagination support)
export const fetchAllShipments = (options = {}) => {
  return axios.get(`${API_URL}/admin/shipments`, options);
};