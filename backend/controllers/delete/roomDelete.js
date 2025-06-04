const Room = require('../../models/roomModel');
const User = require('../../models/userModel');

exports.deleteRoom = async (req, res) => {
  try {
    // Check if user owns the room
    const room = await Room.findOne({ _id: req.params.id, owner: req.user.id });
    if (!room) {
      return res.status(404).json({ message: 'Room not found or unauthorized' });
    }

    await Room.findByIdAndDelete(req.params.id);

    // Remove room reference from user's rooms array
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { rooms: req.params.id }
    });

    res.status(200).json({ message: 'Room deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 