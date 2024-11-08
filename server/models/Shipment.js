const mongoose = require('mongoose');

const updateSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  time: { type: String, required: true }, // storing time as a string for flexibility, or you could use Date with time info
  location: { type: String, required: true },
  status: { type: String, required: true },
  remarks: { type: String, required: false }
});

const shipmentSchema = new mongoose.Schema({
  trackingNumber: { type: String, required: true, unique: true },
  status: { type: String, required: true },
  location: { type: String, required: true },
  updatedAt: { type: Date, default: Date.now },
  updates: [updateSchema] // array of updates
});

module.exports = mongoose.model('Shipment', shipmentSchema);
