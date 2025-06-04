const AdminRoom = require('../../models/roomModel');

exports.getAllAdminRooms = async (req, res) => {
  try {
    const rooms = await AdminRoom.find();
    res.status(200).json(rooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAdminRoomById = async (req, res) => {
  try {
    const room = await AdminRoom.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Admin Room not found' });
    }
    res.status(200).json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 