const Guide = require('../../models/guideModel');

exports.updateGuide = async (req, res) => {
  try {
    const guide = await Guide.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('user', 'name email');
    
    if (!guide) {
      return res.status(404).json({ message: 'Guide not found' });
    }
    res.status(200).json(guide);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}; 