const AdminRoom = require('../../models/roomModel');

exports.createAdminRoom = async (req, res) => {
  try {
    const room = new AdminRoom({
      ...req.body,
      isAdminListed: true
    });
    const savedRoom = await room.save();
    res.status(201).json(savedRoom);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}; 