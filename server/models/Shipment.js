const mongoose = require('mongoose');

const updateSchema = new mongoose.Schema({
  // Full timestamp of the event. Legacy entries store a date-only value plus a `time` string.
  date: { type: Date, required: true },
  time: { type: String, required: false },
  location: { type: String, required: true },
  status: { type: String, required: true },
  remarks: { type: String, required: false }
});

const shipmentSchema = new mongoose.Schema({
  trackingNumber: { type: String, required: true, unique: true, trim: true },
  status: { type: String, required: true },
  location: { type: String, required: true },
  updates: [updateSchema] // array of updates
}, { timestamps: true }); // maintains createdAt/updatedAt on every save

module.exports = mongoose.model('Shipment', shipmentSchema);
