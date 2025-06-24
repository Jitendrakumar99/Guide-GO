const Room = require('../../models/roomModel');
const User = require('../../models/userModel');
const Rating = require('../../models/ratingModel');

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

exports.addRoomRating = async (req, res) => {
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

    await Room.findByIdAndUpdate(
      req.params.id,
      { $push: { ratings: newRating._id } },
      { new: true }
    );

    res.status(201).json(newRating);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 