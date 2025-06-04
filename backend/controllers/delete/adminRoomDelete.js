const AdminRoom = require('../../models/roomModel');

exports.deleteAdminRoom = async (req, res) => {
  try {
    const room = await AdminRoom.findByIdAndDelete(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Admin Room not found' });
    }
    res.status(200).json({ message: 'Admin Room deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 