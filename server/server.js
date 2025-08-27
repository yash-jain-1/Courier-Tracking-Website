// require('dotenv').config(); // Ensure this is at the top
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const Shipment = require('./models/Shipment');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/adminRoutes');  // Correct import

const app = express();

app.use(bodyParser.json());

const cors = require('cors');
const corsOptions = {
  origin: 'https://shanucourier.netlify.app/',
  optionsSuccessStatus: 200 // For legacy browser support
};

app.use(cors(corsOptions));
// MongoDB connection string (ensure to handle this securely)
const MONGO_URI = process.env.MONGO_URI;
// TODO: Remove the connection string from the source code and move it to an environment variable
mongoose.connect(MONGO_URI, {
  dbName: 'test',
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

// Add a new shipment
app.post('/api/shipments', async (req, res) => {
  try {
    const shipment = new Shipment({
      trackingNumber: req.body.trackingNumber,
      status: req.body.status,
      location: req.body.location,
      updates: [] // Initialize empty updates array
    });
    await shipment.save();
    res.status(201).send(shipment);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Fetch a particular shipment by tracking number
app.get('/api/shipments/:trackingNumber', async (req, res) => {
  try {
    const shipment = await Shipment.findOne({ trackingNumber: req.params.trackingNumber });
    if (!shipment) return res.status(404).send("Shipment not found");
    res.send(shipment);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Update a shipment with new status
app.post('/api/shipments/:trackingNumber/updates', async (req, res) => {
  try {
    const { trackingNumber } = req.params;
    const { status, updateData } = req.body;

    // Find the shipment by tracking number
    const shipment = await Shipment.findOne({ trackingNumber });
    if (!shipment) {
      return res.status(404).json({ message: "Shipment not found" });
    }

    // Update the shipment's status
    if (status) {
      shipment.status = status;
    }

    // Add the update to the updates array
    if (updateData) {
      shipment.updates.push(updateData);
    }

    // Save the updated shipment document
    await shipment.save();

    res.status(200).json({ message: "Shipment updated successfully", shipment });
  } catch (error) {
    console.error("Error updating shipment:", error);
    res.status(500).json({ message: "Failed to update shipment" });
  }
});

// Define port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
