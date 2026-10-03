const express = require('express');
const Shipment = require('../models/Shipment');
const { protect } = require('../middlewares/authMiddleware');
const { STATUSES, normalizeStatus, escapeRegex } = require('../utils/shipment');
const router = express.Router();

const MAX_PAGE_SIZE = 100;

// Every admin route requires a valid token
router.use(protect);

const buildShipmentFilter = ({ q, status }) => {
  const filter = {};
  const search = String(q ?? '').trim();
  if (search) {
    filter.trackingNumber = { $regex: escapeRegex(search), $options: 'i' };
  }
  const normalizedStatus = normalizeStatus(status);
  if (normalizedStatus && normalizedStatus !== 'all') {
    // Case-insensitive so legacy mixed-case statuses still match
    filter.status = { $regex: `^${escapeRegex(normalizedStatus)}$`, $options: 'i' };
  }
  return filter;
};

const parsePositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

// Get shipments: ?page=1&limit=10|all&q=<tracking number>&status=<status>
router.get('/shipments', async (req, res) => {
  try {
    const filter = buildShipmentFilter(req.query);
    const sortBy = { updatedAt: -1, _id: -1 };
    const total = await Shipment.countDocuments(filter);

    if (req.query.limit === 'all') {
      const shipments = await Shipment.find(filter).sort(sortBy);
      return res.json({ shipments, total, page: 1, limit: total });
    }

    const limit = Math.min(parsePositiveInt(req.query.limit, 10), MAX_PAGE_SIZE);
    const page = parsePositiveInt(req.query.page, 1);
    const shipments = await Shipment.find(filter)
      .sort(sortBy)
      .skip((page - 1) * limit)
      .limit(limit);
    res.json({ shipments, total, page, limit });
  } catch (err) {
    console.error('Error fetching shipments:', err);
    res.status(500).json({ message: 'Error fetching shipments' });
  }
});

// Shipment counts per status for the dashboard
router.get('/shipments/stats', async (req, res) => {
  try {
    const grouped = await Shipment.aggregate([
      { $group: { _id: { $toLower: '$status' }, count: { $sum: 1 } } },
    ]);
    const byStatus = Object.fromEntries(STATUSES.map((status) => [status, 0]));
    let total = 0;
    grouped.forEach(({ _id, count }) => {
      byStatus[_id] = (byStatus[_id] || 0) + count;
      total += count;
    });
    res.json({ total, byStatus });
  } catch (err) {
    console.error('Error fetching shipment stats:', err);
    res.status(500).json({ message: 'Error fetching shipment stats' });
  }
});

// Delete a shipment by tracking number
router.delete('/shipments/:trackingNumber', async (req, res) => {
  try {
    const { trackingNumber } = req.params;
    const deleted = await Shipment.findOneAndDelete({ trackingNumber });
    if (!deleted) {
      return res.status(404).json({ message: 'Shipment not found' });
    }
    res.json({ message: 'Shipment deleted successfully' });
  } catch (error) {
    console.error('Error deleting shipment:', error);
    res.status(500).json({ message: 'Error deleting shipment' });
  }
});

module.exports = router;
