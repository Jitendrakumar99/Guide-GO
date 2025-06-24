const Guide = require('../../models/guideModel');

exports.getAllGuides = async (req, res) => {
  try {
    const guides = await Guide.find().populate('user', 'name email');
    res.status(200).json(guides);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getGuideById = async (req, res) => {
  try {
    const guide = await Guide.findById(req.params.id)
      .populate('user', 'name email')
      .populate('ratings');
    if (!guide) {
      return res.status(404).json({ message: 'Guide not found' });
    }
    res.status(200).json(guide);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 