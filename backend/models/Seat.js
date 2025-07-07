const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
  seatId: { type: String, required: true, unique: true },
  position: {
    row: { type: Number, required: true },
    col: { type: Number, required: true }
  },
  status: { type: String, enum: ['available', 'booked'], default: 'available' }
});

module.exports = mongoose.model('Seat', seatSchema); 