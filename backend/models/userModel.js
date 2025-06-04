const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, required: true },
  phone: String,
  password: String,
  profilePic: String,
  location: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: [Number]
  },
  rooms: [{ type: mongoose.Schema.Types.ObjectId, ref: "Room" }],
  vehicles: [{ type: mongoose.Schema.Types.ObjectId, ref: "Vehicle" }],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", userSchema); 