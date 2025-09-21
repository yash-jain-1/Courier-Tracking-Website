const express = require('express');
const { login } = require('../controllers/authController');
const Shipment = require('../models/Shipment');  // Ensure the correct path to your Shipment model
const router = express.Router();

router.post('/login', login);

// Get shipments
router.get('/shipments', async (req, res) => {
    const { page = 1, limit = 10 } = req.query; // Default to page 1 and 10 shipments per page
    try {
      let shipments;
      const sortBy = { updatedAt: -1, createdAt: -1 };
      if (limit === 'all') {
        shipments = await Shipment.find().sort(sortBy);
      } else {
        shipments = await Shipment.find()
          .sort(sortBy)
          .skip((page - 1) * limit)
          .limit(parseInt(limit));
      }
      res.json(shipments);
    } catch (err) {
      console.error("Error fetching shipments:", err);
      res.status(500).json({ message: "Error fetching shipments" });
    }
  });

module.exports = router;
