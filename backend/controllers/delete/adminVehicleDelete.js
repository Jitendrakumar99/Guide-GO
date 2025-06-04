const AdminVehicle = require('../../models/vehicleModel');

exports.deleteAdminVehicle = async (req, res) => {
  try {
    const vehicle = await AdminVehicle.findByIdAndDelete(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: 'Admin Vehicle not found' });
    }
    res.status(200).json({ message: 'Admin Vehicle deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 