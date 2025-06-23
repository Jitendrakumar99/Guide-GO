const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No auth token found' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Set user object with both id and _id for backward compatibility
    req.user = {
      id: decoded.id,
      _id: decoded.id,
      email: decoded.email
    };
    
    console.log('Auth middleware - User authenticated:', {
      id: req.user.id,
      _id: req.user._id,
      email: req.user.email
    });
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Please authenticate' });
  }
};

module.exports = auth; 