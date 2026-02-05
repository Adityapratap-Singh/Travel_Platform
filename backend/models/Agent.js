const mongoose = require('mongoose');

const agentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  name: { type: String, required: true },
  phone: { type: String },
  languages: [String],
  city: { type: String },
  country: { type: String },
  bio: { type: String },
  pricePerDay: { type: Number, default: 0 },
  image: { type: String },
  video: { type: String },
  rating: { type: Number, default: 0 },
  verified: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Agent', agentSchema);
