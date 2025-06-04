const AdminRoom = require('../../models/roomModel');

exports.updateAdminRoom = async (req, res) => {
  try {
    const room = await AdminRoom.findByIdAndUpdate(
      req.params.id,
      { ...req.body, isAdminListed: true },
      { new: true, runValidators: true }
    );
    
    if (!room) {
      return res.status(404).json({ message: 'Admin Room not found' });
    }
    res.status(200).json(room);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}; 