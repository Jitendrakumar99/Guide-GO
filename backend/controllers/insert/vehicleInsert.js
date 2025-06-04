const Vehicle = require('../../models/vehicleModel');
const User = require('../../models/userModel');

exports.createVehicle = async (req, res) => {
  try {
    const vehicle = new Vehicle({
      ...req.body,
      owner: req.user.id
    });
    const savedVehicle = await vehicle.save();

    // Add vehicle reference to user's vehicles array
    await User.findByIdAndUpdate(
      req.user.id,
      { $push: { vehicles: savedVehicle._id } },
      { new: true }
    );

    res.status(201).json(savedVehicle);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}; 