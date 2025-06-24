const Guide = require('../../models/guideModel');
const User = require('../../models/userModel');
const Rating = require('../../models/ratingModel');

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

exports.addGuideRating = async (req, res) => {
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

    await Guide.findByIdAndUpdate(
      req.params.id,
      { $push: { ratings: newRating._id } },
      { new: true }
    );

    res.status(201).json(newRating);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 