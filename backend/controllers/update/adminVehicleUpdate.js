const AdminVehicle =require('../../models/vehicleModel');

exports.updateAdminVehicle = async (req, res) => {
  try {
    const vehicle = await AdminVehicle.findByIdAndUpdate(
      req.params.id,
      { ...req.body, isAdminListed: true },
      { new: true, runValidators: true }
    );
    
    if (!vehicle) {
      return res.status(404).json({ message: 'Admin Vehicle not found' });
    }
    res.status(200).json(vehicle);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}; 