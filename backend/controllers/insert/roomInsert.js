const Room = require('../../models/roomModel');
const User = require('../../models/userModel');

exports.createRoom = async (req, res) => {
  try {
    const room = new Room({
      ...req.body,
      owner: req.user.id // From auth middleware
    });
    const savedRoom = await room.save();

    // Add room reference to user's rooms array
    await User.findByIdAndUpdate(
      req.user.id,
      { $push: { rooms: savedRoom._id } },
      { new: true }
    );

    res.status(201).json(savedRoom);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}; 