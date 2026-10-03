// src/services/api.js
import api from '../api/axios';
import { normalizeTrackingNumber } from '../utils/shipment';

const shipmentPath = (trackingNumber) =>
  `/shipments/${encodeURIComponent(normalizeTrackingNumber(trackingNumber))}`;

// Fetch shipment details
export const fetchShipment = (trackingNumber) => api.get(shipmentPath(trackingNumber));

// Admin login
export const adminLogin = (credentials) => api.post('/auth/login', credentials);

// Add a new shipment
export const addShipment = (shipmentData) => api.post('/shipments', shipmentData);

// Add a tracking event to a shipment
export const updateShipment = (trackingNumber, updateData) =>
  api.post(`${shipmentPath(trackingNumber)}/updates`, updateData);

// Fetch shipments for admin: params = { page, limit, q, status }
export const fetchAllShipments = (params = {}) => api.get('/admin/shipments', { params });

// Shipment counts per status for the admin dashboard
export const fetchShipmentStats = () => api.get('/admin/shipments/stats');

// Delete a shipment by its exact stored tracking number (admin)
export const deleteShipment = (trackingNumber) =>
  api.delete(`/admin/shipments/${encodeURIComponent(trackingNumber)}`);

// Human-readable message from an API error
export const getErrorMessage = (error, fallback) => {
  if (error.code === 'ECONNABORTED' || !error.response) {
    return 'Unable to reach the server. It may be starting up — please try again in a moment.';
  }
  return error.response.data?.message || fallback;
};
