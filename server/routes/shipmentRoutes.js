const express = require('express');
const { trackShipment, addShipment, updateShipment, deleteShipment } = require('../controllers/shipmentController');
const { protect } = require('../middlewares/authMiddleware');
const router = express.Router();

router.get('/:trackingNumber', trackShipment);
router.post('/', protect, addShipment);
router.put('/:id', protect, updateShipment);
router.delete('/:trackingNumber', protect, deleteShipment);

module.exports = router;
