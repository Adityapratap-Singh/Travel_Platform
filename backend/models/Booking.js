const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  type: { type: String, enum: ['agent', 'hotel', 'trip', 'guide'], required: true, default: 'agent' },
  agent: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent' },
  hotel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel' },
  guide: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  destinationId: { type: String },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  travelers: { type: Number, default: 1 },
  totalPrice: { type: Number },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
