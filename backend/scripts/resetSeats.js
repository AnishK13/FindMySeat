// backend/scripts/resetSeats.js
const mongoose = require('mongoose');
const Seat = require('../models/Seat');
const Booking = require('../models/Booking');
require('dotenv').config();

async function resetSeats() {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  await Seat.updateMany({}, { status: 'available' });
  await Booking.updateMany({ status: 'active' }, { status: 'cancelled' });
  console.log('All seats set to available and active bookings cancelled.');
  process.exit();
}

resetSeats();