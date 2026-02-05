const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  destinations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Destination'
  }],
  hotel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel'
  },
  route: [{
    id: String,
    name: String,
    lat: Number,
    lng: Number,
    type: String // 'hotel' or 'destination'
  }],
  startDate: Date,
  endDate: Date,
  isPublic: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Trip', tripSchema);
