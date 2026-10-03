const Shipment = require('../models/Shipment');

// Canonical shipment statuses; stored lowercase
const STATUSES = ['processing', 'picked up', 'in transit', 'out for delivery', 'delivered', 'delayed'];

// Allow a little clock skew between the admin's browser and the server
const MAX_FUTURE_SKEW_MS = 5 * 60 * 1000;

const normalizeTrackingNumber = (value) => String(value ?? '').trim().toUpperCase();

const normalizeStatus = (value) => String(value ?? '').trim().toLowerCase();

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// New shipments are stored uppercase; fall back to a case-insensitive match for legacy records
const findByTrackingNumber = async (rawTrackingNumber) => {
  const trackingNumber = normalizeTrackingNumber(rawTrackingNumber);
  if (!trackingNumber) return null;

  const exact = await Shipment.findOne({ trackingNumber });
  if (exact) return exact;

  return Shipment.findOne({
    trackingNumber: { $regex: `^${escapeRegex(trackingNumber)}$`, $options: 'i' },
  });
};

// Returns a Date, or null when the value is missing/invalid/in the future
const parseEventDate = (value) => {
  if (value === undefined || value === null || value === '') return new Date();
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  if (date.getTime() > Date.now() + MAX_FUTURE_SKEW_MS) return null;
  return date;
};

// Admins enter event times with minute precision, so compare at that precision
const toMinute = (date) => Math.floor(new Date(date).getTime() / 60000);

// The latest event (by minute, then insertion order) determines the current status/location,
// so a back-dated correction does not overwrite newer information
const getLatestUpdateIndex = (updates) => {
  let latestIndex = -1;
  let latestTime = -Infinity;
  updates.forEach((update, index) => {
    const time = toMinute(update.date);
    if (time >= latestTime) {
      latestIndex = index;
      latestTime = time;
    }
  });
  return latestIndex;
};

module.exports = {
  STATUSES,
  normalizeTrackingNumber,
  normalizeStatus,
  escapeRegex,
  findByTrackingNumber,
  parseEventDate,
  getLatestUpdateIndex,
};
