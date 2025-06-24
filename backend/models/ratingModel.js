const mongoose = require('mongoose');
const ratingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  avatar: { type: String },
  rating: { type: Number, required: true, min: 1, max: 5 },
  date: { type: Date, default: Date.now },
  text: { type: String, required: true }
});
module.exports = mongoose.model('Rating', ratingSchema); 