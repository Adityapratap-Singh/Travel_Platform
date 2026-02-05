const mongoose = require('mongoose');

const itinerarySchema = new mongoose.Schema({
  name: String,
  days: [{
    day: Number,
    title: String,
    activities: [{
      time: String,
      description: String
    }]
  }]
});

const reviewSchema = new mongoose.Schema({
  id: String,
  author: String,
  avatar: String,
  rating: Number,
  date: String,
  comment: String
});

const nearbySpotSchema = new mongoose.Schema({
  id: String,
  name: String,
  lat: Number,
  lng: Number,
  type: String
});

const destinationSchema = new mongoose.Schema({
  id: { type: String, unique: true }, // Keeping string ID for compatibility
  name: { type: String, required: true },
  location: String,
  description: String,
  fullDescription: String,
  price: Number,
  rating: Number,
  image: String,
  video: String,
  lat: Number,
  lng: Number,
  highlights: [String],
  duration: String,
  season: [String], // Changed to array for better filtering (e.g. ['Winter', 'Monsoon'])
  interests: [String],
  country: String,
  bestTime: String,
  reviews: [reviewSchema],
  safety: {
    score: Number,
    status: String,
    description: String
  },
  itineraries: [itinerarySchema],
  nearbySpots: [nearbySpotSchema],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  verified: { type: Boolean, default: false } // Admin verification
}, { timestamps: true });

module.exports = mongoose.model('Destination', destinationSchema);
