const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema({
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
  title: { type: String, required: true }, // E.g., Honda Activa 125
  vehicleType: { 
    type: String, 
    enum: ["Car", "Bike", "Scooter", "Bicycle"], 
    required: true 
  },
  brand: { type: String }, // E.g., Honda, Hero, Suzuki
  model: { type: String }, // E.g., Activa 125, Splendor
  registrationNumber: { type: String }, // Optional but useful
  fuelType: { type: String, enum: ["Petrol", "Diesel", "Electric"], default: "Petrol" },
  transmission: { type: String, enum: ["Manual", "Automatic"] },
  description: String,
  location: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: [Number] // [longitude, latitude]
  },
  address: { type: String }, // Human-readable address
  pricePerDay: { type: Number, required: true },
  rating: { type: Number, default: 0 }, // Average rating
  capacity: { type: Number }, // How many passengers
  images: [String],
  amenities: [String], // Optional: e.g., ['Helmet Included', 'GPS']
  available: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  ratings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Rating' }],
});

vehicleSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Vehicle", vehicleSchema);
