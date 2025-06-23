const Booking = require('../../models/bookingModel');
const User = require('../../models/userModel');

// Update booking status (for owners)
exports.updateBookingStatus = async (req, res) => {
  try {
    console.log('Update booking status request received');
    console.log('Booking ID:', req.params.id);
    console.log('User ID:', req.user._id);
    console.log('New status:', req.body.status);
    
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      console.log('Booking not found');
      return res.status(404).json({ message: 'Booking not found' });
    }

    console.log('Booking found:', {
      id: booking._id,
      booker: booking.booker,
      owner: booking.owner,
      status: booking.status,
      totalAmount: booking.totalAmount
    });

    // Check if the user is the owner of the listing
    console.log('Checking authorization - User ID:', req.user._id, 'Owner ID:', booking.owner);
    if (booking.owner.toString() !== req.user._id.toString()) {
      console.log('Authorization failed - user is not the owner');
      return res.status(403).json({ message: 'Not authorized to update this booking' });
    }

    // Validate status
    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (!validStatuses.includes(status)) {
      console.log('Invalid status:', status);
      return res.status(400).json({ message: 'Invalid status' });
    }

    // Update booking status
    console.log('Updating booking status from', booking.status, 'to', status);
    booking.status = status;
    await booking.save();

    // If status is being changed to 'completed', add earnings to owner
    if (status === 'completed' && booking.status !== 'completed') {
      console.log('Adding earnings to owner for completed booking');
      
      const owner = await User.findById(booking.owner);
      if (owner) {
        // Update earnings
        owner.earnings.totalEarnings += booking.totalAmount;
        owner.earnings.completedBookings += 1;
        owner.earnings.pendingPayout += booking.totalAmount;
        
        // Add to earnings history
        owner.earningsHistory.push({
          bookingId: booking._id,
          amount: booking.totalAmount,
          bookingType: booking.bookingType,
          listingTitle: booking.listingTitle,
          completedAt: new Date(),
          status: 'earned'
        });
        
        await owner.save();
        
        console.log('Earnings updated for owner:', {
          ownerId: owner._id,
          totalEarnings: owner.earnings.totalEarnings,
          completedBookings: owner.earnings.completedBookings,
          pendingPayout: owner.earnings.pendingPayout
        });
      }
    }

    console.log('Booking status updated successfully');
    res.json(booking);
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ message: 'Failed to update booking status' });
  }
};

// Cancel booking (for users)
exports.cancelBooking = async (req, res) => {
  try {
    console.log('Cancel booking request received');
    console.log('Booking ID:', req.params.id);
    console.log('User ID:', req.user._id);
    
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      console.log('Booking not found');
      return res.status(404).json({ message: 'Booking not found' });
    }

    console.log('Booking found:', {
      id: booking._id,
      booker: booking.booker,
      owner: booking.owner,
      status: booking.status
    });

    // Check if the user is the booker
    console.log('Checking authorization - User ID:', req.user._id, 'Booker ID:', booking.booker);
    if (booking.booker.toString() !== req.user._id.toString()) {
      console.log('Authorization failed - user is not the booker');
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }

    // Check if booking can be cancelled
    if (booking.status === 'cancelled') {
      console.log('Booking is already cancelled');
      return res.status(400).json({ message: 'Booking is already cancelled' });
    }

    if (booking.status === 'completed') {
      console.log('Cannot cancel completed booking');
      return res.status(400).json({ message: 'Cannot cancel a completed booking' });
    }

    // Update booking status to cancelled
    console.log('Updating booking status to cancelled');
    booking.status = 'cancelled';
    await booking.save();

    console.log('Booking cancelled successfully');
    res.json(booking);
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ message: 'Failed to cancel booking' });
  }
}; 