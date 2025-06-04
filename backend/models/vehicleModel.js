const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  title: String,
  vehicleType: { 
    type: String, 
    enum: ["Car", "Bike", "Scooter", "Bicycle"], 
    required: true 
  },
  description: String,
  location: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: [Number]
  },
  pricePerDay: Number,
  images: [String],
  available: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

vehicleSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Vehicle", vehicleSchema); 