const Booking = require('../../models/bookingModel');
const Room = require('../../models/roomModel');
const Vehicle = require('../../models/vehicleModel');
const mongoose = require('mongoose');

// Get all bookings made by the current user (when they book others' listings)
exports.getUserBookings = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const objectId = new mongoose.Types.ObjectId(userId);
    
    // Find all bookings where the current user is the booker
    const bookings = await Booking.find({ booker: objectId })
      .sort({ createdAt: -1 })
      .populate('listing', 'title images pricePerNight pricePerDay')
      .populate('owner', 'name email phone');

    // Format the response
    const formattedBookings = bookings.map(booking => ({
      _id: booking._id,
      bookingType: booking.bookingType, // 'room' or 'vehicle'
      status: booking.status,
      startDate: booking.startDate,
      endDate: booking.endDate,
      totalAmount: booking.totalAmount,
      paymentStatus: booking.paymentStatus,
      paymentMethod: booking.paymentMethod,
      listingTitle: booking.listingTitle,
      listingPrice: booking.listingPrice,
      listingImage: booking.listing?.images?.[0] || null,
      ownerName: booking.owner.name,
      ownerEmail: booking.owner.email,
      ownerPhone: booking.owner.phone,
      specialRequests: booking.specialRequests,
      numberOfGuests: booking.numberOfGuests,
      pickupLocation: booking.pickupLocation,
      dropoffLocation: booking.dropoffLocation,
      createdAt: booking.createdAt
    }));

    res.json(formattedBookings);
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    res.status(500).json({ message: 'Failed to fetch user bookings' });
  }
};

// Get all bookings received by the current user (when others book their listings)
exports.getOwnerBookings = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const objectId = new mongoose.Types.ObjectId(userId);
    
    // Find all bookings where the current user is the owner
    const bookings = await Booking.find({ owner: objectId })
      .sort({ createdAt: -1 })
      .populate('listing', 'title images pricePerNight pricePerDay')
      .populate('booker', 'name email phone');

    // Format the response
    const formattedBookings = bookings.map(booking => ({
      _id: booking._id,
      bookingType: booking.bookingType, // 'room' or 'vehicle'
      status: booking.status,
      startDate: booking.startDate,
      endDate: booking.endDate,
      totalAmount: booking.totalAmount,
      paymentStatus: booking.paymentStatus,
      paymentMethod: booking.paymentMethod,
      listingTitle: booking.listingTitle,
      listingPrice: booking.listingPrice,
      listingImage: booking.listing?.images?.[0] || null,
      bookerName: booking.booker.name,
      bookerEmail: booking.booker.email,
      bookerPhone: booking.booker.phone,
      specialRequests: booking.specialRequests,
      numberOfGuests: booking.numberOfGuests,
      pickupLocation: booking.pickupLocation,
      dropoffLocation: booking.dropoffLocation,
      createdAt: booking.createdAt
    }));

    res.json(formattedBookings);
  } catch (error) {
    console.error('Error fetching owner bookings:', error);
    res.status(500).json({ message: 'Failed to fetch owner bookings' });
  }
};

// Get a single booking by ID
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('listing', 'title images pricePerNight pricePerDay')
      .populate('owner', 'name email phone')
      .populate('booker', 'name email phone');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if the user is either the booker or the owner of the listing
    const userId = req.user._id || req.user.id;
    const isBooker = booking.booker._id.toString() === userId.toString();
    const isOwner = booking.owner._id.toString() === userId.toString();

    if (!isBooker && !isOwner) {
      return res.status(403).json({ message: 'Not authorized to view this booking' });
    }

    res.json(booking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ message: 'Failed to fetch booking' });
  }
}; 