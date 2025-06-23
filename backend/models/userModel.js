const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, required: true },
  phone: String,
  password: String,
  profilePic: String,
  address:String,
  location: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: [Number]
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft'
  },
  rooms: [{ type: mongoose.Schema.Types.ObjectId, ref: "Room" }],
  vehicles: [{ type: mongoose.Schema.Types.ObjectId, ref: "Vehicle" }],
  earnings: {
    totalEarnings: { type: Number, default: 0 },
    completedBookings: { type: Number, default: 0 },
    pendingPayout: { type: Number, default: 0 },
    totalPayout: { type: Number, default: 0 }
  },
  earningsHistory: [{
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
    amount: { type: Number, required: true },
    bookingType: { type: String, enum: ['room', 'vehicle'] },
    listingTitle: String,
    completedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['earned', 'paid'], default: 'earned' }
  }],
  notifications: [
    {
      type: { type: String, enum: ['booking', 'payment', 'message', 'system'], required: true },
      title: { type: String, required: true },
      message: { type: String, required: true },
      read: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now }
    }
  ],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", userSchema); 