const Guide = require('../../models/guideModel');

exports.deleteGuide = async (req, res) => {
  try {
    const guide = await Guide.findByIdAndDelete(req.params.id);
    if (!guide) {
      return res.status(404).json({ message: 'Guide not found' });
    }
    res.status(200).json({ message: 'Guide deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 