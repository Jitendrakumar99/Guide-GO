const AdminVehicle = require('../../models/vehicleModel');

exports.createAdminVehicle = async (req, res) => {
  try {
    const vehicle = new AdminVehicle({
      ...req.body,
      isAdminListed: true
    });
    const savedVehicle = await vehicle.save();
    res.status(201).json(savedVehicle);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}; 