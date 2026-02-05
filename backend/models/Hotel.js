const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  name: { type: String, required: true },
  location: { type: String, required: true }, // e.g., "Paris, France" or "Kyoto, Japan"
  city: { type: String, required: true }, // To easily filter by city
  description: String,
  pricePerNight: Number,
  rating: Number,
  image: String,
  lat: Number,
  lng: Number,
  amenities: [String],
  verified: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Hotel', hotelSchema);
