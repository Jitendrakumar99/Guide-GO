const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  ownerModel: {
    type: String,
    enum: ['User', 'Admin'],
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'ownerModel'
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft'
  },
  title: String,
  description: String,
  address: String,
  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point"
    },
    coordinates: [Number] // [longitude, latitude]
  },
  type: { type: String }, // e.g., Deluxe, Suite, etc.
  rating: { type: Number, default: 0 }, // average rating
  capacity: { type: Number }, // number of people the room can accommodate
  pricePerNight: Number,
  images: [String],
  amenities: [String],
  available: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  ratings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Rating' }]
});

roomSchema.index({ location: "2dsphere" });
module.exports = mongoose.model("Room", roomSchema); 