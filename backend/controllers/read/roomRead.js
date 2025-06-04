const Room = require('../../models/roomModel');

exports.getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find().populate('owner', 'name email');
    res.status(200).json(rooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate('owner', 'name email');
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.status(200).json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 