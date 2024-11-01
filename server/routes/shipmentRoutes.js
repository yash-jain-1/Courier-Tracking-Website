const express = require('express');
const { trackShipment, addShipment, updateShipment } = require('../controllers/shipmentController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/:trackingNumber', trackShipment);
router.post('/', protect, addShipment);
router.put('/:id', protect, updateShipment);

module.exports = router;
