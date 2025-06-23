const path = require('path');

exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Return the relative path of the uploaded file
    const relativePath = path.join('uploads', req.file.filename).replace(/\\/g, '/');
    
    res.status(200).json({
      message: 'File uploaded successfully',
      imagePath: relativePath
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ message: 'Error uploading file' });
  }
};

exports.uploadMultipleImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    // Return the relative paths of the uploaded files
    const imagePaths = req.files.map(file => 
      path.join('uploads', file.filename).replace(/\\/g, '/')
    );
    
    res.status(200).json({
      message: 'Files uploaded successfully',
      imagePaths: imagePaths
    });
  } catch (error) {
    console.error('Error uploading files:', error);
    res.status(500).json({ message: 'Error uploading files' });
  }
}; 