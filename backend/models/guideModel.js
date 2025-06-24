const mongoose = require("mongoose");

const guideSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  images: [String],
  title: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  duration: {
    type: String,
    required: true,
  },
  spots: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  ratings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Rating' }],
  createdAt: { type: Date, default: Date.now },
});

// guideSchema.index({ city: 1, state: 1 });

module.exports = mongoose.model("Guide", guideSchema); 