const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  title: String,
  description: String,
  address: String,
  location: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: [Number]
  },
  pricePerNight: Number,
  images: [String],
  amenities: [String],
  available: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

roomSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Room", roomSchema); 