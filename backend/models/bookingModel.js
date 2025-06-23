const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  // Booking details
  bookingType: {
    type: String,
    enum: ['room', 'vehicle'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'upi'],
    required: true
  },

  // Booker details
  booker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bookerName: {
    type: String,
    required: true
  },
  bookerEmail: {
    type: String,
    required: true
  },
  bookerPhone: {
    type: String,
    required: true
  },
  bookerAddress: {
    type: String,
    default: ''
  },

  // Listing details
  listing: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'listingModel',
    required: true
  },
  listingModel: {
    type: String,
    enum: ['Room', 'Vehicle'],
    required: true
  },
  listingTitle: {
    type: String,
    required: true
  },
  listingPrice: {
    type: Number,
    required: true
  },

  // Owner details
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ownerName: {
    type: String,
    required: true
  },
  ownerEmail: {
    type: String,
    default: ''
  },
  ownerPhone: {
    type: String,
    default: ''
  },

  // Additional details
  specialRequests: {
    type: String,
    default: ''
  },
  numberOfGuests: {
    type: Number,
    required: function() {
      return this.bookingType === 'room';
    }
  },
  pickupLocation: {
    type: String,
    required: function() {
      return this.bookingType === 'vehicle';
    }
  },
  dropoffLocation: {
    type: String,
    required: function() {
      return this.bookingType === 'vehicle';
    }
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Add indexes for better query performance
bookingSchema.index({ booker: 1, status: 1 });
bookingSchema.index({ owner: 1, status: 1 });
bookingSchema.index({ listing: 1, status: 1 });
bookingSchema.index({ startDate: 1, endDate: 1 });

// Add validation for dates
bookingSchema.pre('save', function(next) {
  if (this.startDate >= this.endDate) {
    next(new Error('End date must be after start date'));
  }
  next();
});

// Add method to calculate total amount
bookingSchema.methods.calculateTotalAmount = function() {
  const days = Math.ceil((this.endDate - this.startDate) / (1000 * 60 * 60 * 24));
  this.totalAmount = this.listingPrice * days;
  return this.totalAmount;
};

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking; 