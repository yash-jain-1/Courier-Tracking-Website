require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Shipment = require('./models/Shipment');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/adminRoutes');
const { protect } = require('./middlewares/authMiddleware');
const {
  STATUSES,
  normalizeTrackingNumber,
  normalizeStatus,
  findByTrackingNumber,
  parseEventDate,
  getLatestUpdateIndex,
} = require('./utils/shipment');

const app = express();

const DEFAULT_CORS_ORIGINS = [
  'http://localhost:3000',
  'https://shanucourier.netlify.app',
  'https://indoreparcel.in',
  'https://www.indoreparcel.in',
];
const corsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean)
  : DEFAULT_CORS_ORIGINS;

app.use(cors({ origin: corsOrigins, credentials: true }));
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
  dbName: process.env.MONGO_DB_NAME || 'test',
})
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));

app.get('/', (req, res) => {
  res.send('Hello World');
});

// Use the admin routes
app.use('/api/admin', adminRoutes);

// Use the auth routes
app.use('/api/auth', authRoutes);

const trimOrUndefined = (value) => {
  const trimmed = String(value ?? '').trim();
  return trimmed || undefined;
};

// Add a new shipment
app.post('/api/shipments', protect, async (req, res) => {
  try {
    const trackingNumber = normalizeTrackingNumber(req.body.trackingNumber);
    const status = normalizeStatus(req.body.status);
    const location = trimOrUndefined(req.body.location);

    if (!trackingNumber || !location) {
      return res.status(400).json({ message: 'Tracking number and location are required' });
    }
    if (!STATUSES.includes(status)) {
      return res.status(400).json({ message: `Status must be one of: ${STATUSES.join(', ')}` });
    }
    if (await findByTrackingNumber(trackingNumber)) {
      return res.status(409).json({ message: `Tracking number ${trackingNumber} already exists` });
    }

    const shipment = new Shipment({
      trackingNumber,
      status,
      location,
      // Seed the timeline so customers see the shipment's first event
      updates: [{
        date: new Date(),
        location,
        status,
        remarks: trimOrUndefined(req.body.remarks),
      }],
    });
    await shipment.save();
    res.status(201).json(shipment);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Tracking number already exists' });
    }
    console.error('Error creating shipment:', error);
    res.status(500).json({ message: 'Failed to create shipment' });
  }
});

// Fetch a particular shipment by tracking number
app.get('/api/shipments/:trackingNumber', async (req, res) => {
  try {
    const shipment = await findByTrackingNumber(req.params.trackingNumber);
    if (!shipment) return res.status(404).json({ message: 'Shipment not found' });
    res.json(shipment);
  } catch (error) {
    console.error('Error fetching shipment:', error);
    res.status(500).json({ message: 'Failed to fetch shipment' });
  }
});

// Add a tracking event; the shipment's current status/location follow its latest event
app.post('/api/shipments/:trackingNumber/updates', protect, async (req, res) => {
  try {
    const { updateData = {} } = req.body;
    const status = normalizeStatus(req.body.status || updateData.status);
    const location = trimOrUndefined(updateData.location);
    const date = parseEventDate(updateData.date);

    if (!STATUSES.includes(status)) {
      return res.status(400).json({ message: `Status must be one of: ${STATUSES.join(', ')}` });
    }
    if (!location) {
      return res.status(400).json({ message: 'Location is required' });
    }
    if (!date) {
      return res.status(400).json({ message: 'Update date is invalid or in the future' });
    }

    const shipment = await findByTrackingNumber(req.params.trackingNumber);
    if (!shipment) {
      return res.status(404).json({ message: 'Shipment not found' });
    }

    shipment.updates.push({
      date,
      location,
      status,
      remarks: trimOrUndefined(updateData.remarks),
    });

    if (getLatestUpdateIndex(shipment.updates) === shipment.updates.length - 1) {
      shipment.status = status;
      shipment.location = location;
    }

    await shipment.save();

    res.status(200).json({ message: 'Shipment updated successfully', shipment });
  } catch (error) {
    console.error('Error updating shipment:', error);
    res.status(500).json({ message: 'Failed to update shipment' });
  }
});

// Export app for testing; only start server if run directly
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);

    // Keep-alive ping to prevent Render free tier from spinning down
    const SELF_URL = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;
    setInterval(() => {
      const http = SELF_URL.startsWith('https') ? require('https') : require('http');
      http.get(`${SELF_URL}/`, (res) => {
        console.log(`Keep-alive ping: ${res.statusCode}`);
      }).on('error', (err) => {
        console.error('Keep-alive ping failed:', err.message);
      });
    }, 14 * 60 * 1000); // every 14 minutes
  });
}

module.exports = app;
