const User = require('../../models/userModel');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .populate({
        path: 'rooms',
        select: 'title description pricePerNight images location'
      })
      .populate({
        path: 'vehicles',
        select: 'title vehicleType description pricePerDay images location'
      });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate({
        path: 'rooms',
        select: 'title description pricePerNight images location amenities'
      })
      .populate({
        path: 'vehicles',
        select: 'title vehicleType description pricePerDay images location available'
      });
      
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 