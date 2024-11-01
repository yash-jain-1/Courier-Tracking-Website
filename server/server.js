// require('dotenv').config(); // Ensure this is at the top

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const Shipment = require('./models/Shipment');

const app = express();
app.use(bodyParser.json());

MONGO_URI = "mongodb+srv://yashjainstudy:dTnOPPfBqGs6maM2@courier.gv4ed.mongodb.net/?retryWrites=true&w=majority&appName=Courier";
// Debug: Check if MONGO_URI is being read correctly
// console.log("MongoDB URI:", process.env.MONGO_URI);

mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("MongoDB connected"))
    .catch(err => console.log("MongoDB connection error:", err));

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.post('/api/shipments', async (req, res) => {
    try {
        const shipment = new Shipment(req.body);
        await shipment.save();
        res.status(201).send(shipment);
    } catch (error) {
        res.status(400).send(error);
    }
});

app.get('/api/shipments/:trackingNumber', async (req, res) => {
    try {
        const shipment = await Shipment.findOne({ trackingNumber: req.params.trackingNumber });
        if (!shipment) return res.status(404).send("Shipment not found");
        res.send(shipment);
    } catch (error) {
        res.status(500).send(error);
    }
});

app.post('/api/shipments/:trackingNumber/updates', async (req, res) => {
  try {
    const shipment = await Shipment.findOne({ trackingNumber: req.params.trackingNumber });
    if (!shipment) return res.status(404).send("Shipment not found");

    // Push new update into the `updates` array
    shipment.updates.push({
      date: req.body.date,
      time: req.body.time,
      location: req.body.location,
      activity: req.body.activity,
      remarks: req.body.remarks
    });

    // Save the updated shipment
    await shipment.save();

    res.send(shipment);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Define port
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
