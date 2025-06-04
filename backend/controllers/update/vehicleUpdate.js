const Vehicle = require('../../models/vehicleModel');

exports.updateVehicle = async (req, res) => {
  try {
    // Check if user owns the vehicle
    const vehicle = await Vehicle.findOne({ _id: req.params.id, owner: req.user.id });
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found or unauthorized' });
    }

    const updatedVehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('owner', 'name email');
    
    res.status(200).json(updatedVehicle);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}; 