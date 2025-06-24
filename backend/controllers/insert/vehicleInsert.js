const Vehicle = require('../../models/vehicleModel');
const User = require('../../models/userModel');
const Rating = require('../../models/ratingModel');

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

exports.addVehicleRating = async (req, res) => {
  try {
    const { rating, text, name, avatar } = req.body;
    const user = req.user._id;

    const newRating = new Rating({
      user,
      name,
      avatar,
      rating,
      text
    });
    await newRating.save();

    await Vehicle.findByIdAndUpdate(
      req.params.id,
      { $push: { ratings: newRating._id } },
      { new: true }
    );

    res.status(201).json(newRating);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 