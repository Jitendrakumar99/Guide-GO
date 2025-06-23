const User = require('../../models/userModel');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .populate({
        path: 'rooms',
        select: 'title description pricePerNight images location'
      })
      .populate({
        path: 'vehicles',
        select: 'title vehicleType description pricePerDay images location'
      });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate({
        path: 'rooms',
        select: 'title description pricePerNight images location amenities'
      })
      .populate({
        path: 'vehicles',
        select: 'title vehicleType description pricePerDay images location available'
      });
      
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate({
        path: 'rooms',
        select: 'title description pricePerNight images location amenities'
      })
      .populate({
        path: 'vehicles',
        select: 'title vehicleType description pricePerDay images location available'
      });
      
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get current user's earnings summary
exports.getUserEarnings = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('earnings');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({
      earnings: user.earnings || {
        totalEarnings: 0,
        completedBookings: 0,
        pendingPayout: 0,
        totalPayout: 0
      }
    });
  } catch (error) {
    console.error('Error fetching user earnings:', error);
    res.status(500).json({ message: 'Failed to fetch earnings' });
  }
};

// Get current user's earnings history
exports.getUserEarningsHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    
    const user = await User.findById(req.user.id)
      .populate({
        path: 'earningsHistory.bookingId',
        select: 'bookingType listingTitle startDate endDate totalAmount'
      })
      .select('earningsHistory');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Sort earnings history by completedAt (newest first)
    const sortedHistory = user.earningsHistory.sort((a, b) => 
      new Date(b.completedAt) - new Date(a.completedAt)
    );
    
    // Apply pagination
    const paginatedHistory = sortedHistory.slice(skip, skip + parseInt(limit));
    
    res.status(200).json({
      earningsHistory: paginatedHistory,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(user.earningsHistory.length / limit),
        totalItems: user.earningsHistory.length,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching earnings history:', error);
    res.status(500).json({ message: 'Failed to fetch earnings history' });
  }
}; 