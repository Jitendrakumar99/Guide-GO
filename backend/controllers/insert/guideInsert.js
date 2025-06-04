const Guide = require('../../models/guideModel');


exports.createGuide = async (req, res) => {
  try {
    const guide = new Guide({
      ...req.body,
      user: req.user.id
    });
    const savedGuide = await guide.save();

    // Add guide reference to user if needed
    // Note: Current schema doesn't have guides array in user model
    // You might want to add it if needed

    res.status(201).json(savedGuide);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}; 