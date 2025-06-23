const Booking = require('../../models/bookingModel');

// Create a new booking
exports.createBooking = async (req, res) => {
  try {
    const {
      bookingType,
      startDate,
      endDate,
      totalAmount,
      paymentMethod,
      booker,
      bookerName,
      bookerEmail,
      bookerPhone,
      listing,
      listingModel,
      listingTitle,
      listingPrice,
      owner,
      ownerName,
      numberOfGuests,
      pickupLocation,
      dropoffLocation,
      specialRequests
    } = req.body;

    // Validate core required fields
    const requiredFields = {
      bookingType: 'Booking type',
      startDate: 'Start date',
      endDate: 'End date',
      totalAmount: 'Total amount',
      paymentMethod: 'Payment method',
      booker: 'Booker ID',
      bookerName: 'Booker name',
      bookerEmail: 'Booker email',
      bookerPhone: 'Booker phone',
      listing: 'Listing ID',
      listingModel: 'Listing model',
      listingTitle: 'Listing title',
      listingPrice: 'Listing price',
      owner: 'Owner ID',
      ownerName: 'Owner name'
    };

    // Check for missing required fields
    const missingFields = Object.entries(requiredFields)
      .filter(([key]) => !req.body[key])
      .map(([_, label]) => label);

    if (missingFields.length > 0) {
      return res.status(400).json({ 
        message: 'Missing required fields', 
        missingFields 
      });
    }

    // Validate type-specific required fields
    if (bookingType === 'room' && !numberOfGuests) {
      return res.status(400).json({ 
        message: 'Missing required fields', 
        missingFields: ['Number of guests'] 
      });
    }

    if (bookingType === 'vehicle' && (!pickupLocation || !dropoffLocation)) {
      return res.status(400).json({ 
        message: 'Missing required fields', 
        missingFields: ['Pickup location', 'Dropoff location'] 
      });
    }

    // Create booking with required fields and optional fields
    const booking = new Booking({
      bookingType,
      status: 'pending',
      startDate,
      endDate,
      totalAmount,
      paymentStatus: 'pending',
      paymentMethod,
      booker,
      bookerName,
      bookerEmail,
      bookerPhone,
      bookerAddress: req.body.bookerAddress || '',
      listing,
      listingModel,
      listingTitle,
      listingPrice,
      owner,
      ownerName,
      ownerEmail: req.body.ownerEmail || '',
      ownerPhone: req.body.ownerPhone || '',
      specialRequests: specialRequests || '',
      numberOfGuests: bookingType === 'room' ? numberOfGuests : undefined,
      pickupLocation: bookingType === 'vehicle' ? pickupLocation : undefined,
      dropoffLocation: bookingType === 'vehicle' ? dropoffLocation : undefined
    });

    await booking.save();
    res.status(201).json(booking);
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ 
      message: 'Failed to create booking', 
      error: error.message 
    });
  }
}; 