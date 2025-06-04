const AdminVehicle = require('../../models/vehicleModel');

exports.getAllAdminVehicles = async (req, res) => {
  try {
    const vehicles = await AdminVehicle.find();
    res.status(200).json(vehicles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAdminVehicleById = async (req, res) => {
  try {
    const vehicle = await AdminVehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: 'Admin Vehicle not found' });
    }
    res.status(200).json(vehicle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 