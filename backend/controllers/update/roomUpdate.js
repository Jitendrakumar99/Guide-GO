const Room = require('../../models/roomModel');

exports.updateRoom = async (req, res) => {
  try {
    // Check if user owns the room
    const room = await Room.findOne({ _id: req.params.id, owner: req.user.id });
    if (!room) {
      return res.status(404).json({ message: 'Room not found or unauthorized' });
    }

    const updatedRoom = await Room.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('owner', 'name email');
    
    res.status(200).json(updatedRoom);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}; 