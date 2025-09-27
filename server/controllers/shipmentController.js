const Shipment = require('../models/Shipment');

exports.trackShipment = async (req, res) => {
  const { trackingNumber } = req.params;
  const shipment = await Shipment.findOne({ trackingNumber });

  if (!shipment) return res.status(404).json({ message: 'Shipment not found' });
  res.json(shipment);
};

exports.addShipment = async (req, res) => {
  const { trackingNumber, status, location } = req.body;

  const shipment = new Shipment({ trackingNumber, status, location });
  await shipment.save();
  res.json(shipment);
};

exports.updateShipment = async (req, res) => {
  const { id } = req.params;
  const { status, location } = req.body;

  const shipment = await Shipment.findByIdAndUpdate(id, { status, location }, { new: true });
  res.json(shipment);
};

exports.deleteShipment = async (req, res) => {
  try {
    const { trackingNumber } = req.params;
    const deleted = await Shipment.findOneAndDelete({ trackingNumber });
    if (!deleted) {
      return res.status(404).json({ message: 'Shipment not found' });
    }
    res.json({ message: 'Shipment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting shipment', error });
  }
};
