const Vehicle = require('../../models/vehicleModel');
const User = require('../../models/userModel');

exports.deleteVehicle = async (req, res) => {
  try {
    // Check if user owns the vehicle
    const vehicle = await Vehicle.findOne({ _id: req.params.id, owner: req.user.id });
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found or unauthorized' });
    }

    await Vehicle.findByIdAndDelete(req.params.id);

    // Remove vehicle reference from user's vehicles array
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { vehicles: req.params.id }
    });

    res.status(200).json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 