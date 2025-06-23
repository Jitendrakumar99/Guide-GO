const mongoose = require("mongoose");

const guideSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: String,
  description: String,
  location: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: [Number]
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft'
  },
  pricePerDay: Number,
  languages: [String],
  experience: Number,
  ratings: { type: Number, default: 0 },
  available: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

guideSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Guide", guideSchema); 