const User = require('../../models/userModel');

exports.updateCurrentUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id, // Use the authenticated user's ID from the token
      req.body,
      { new: true, runValidators: true }
    ).populate({
      path: 'rooms',
      select: 'title description pricePerNight images location amenities'
    }).populate({
      path: 'vehicles',
      select: 'title vehicleType description pricePerDay images location available'
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id, 
      req.body,
      { new: true, runValidators: true }
    );
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}; 