const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  seat: { type: mongoose.Schema.Types.ObjectId, ref: 'Seat', required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  status: { type: String, enum: ['active', 'cancelled', 'expired'], default: 'active' }
});

module.exports = mongoose.model('Booking', bookingSchema); 