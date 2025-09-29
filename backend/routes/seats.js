const express = require('express');
const router = express.Router();
const Seat = require('../models/Seat');
const Booking = require('../models/Booking');
const mongoose = require('mongoose');

// Reading hall coordinates
const HALL_LAT = 18.457918;
const HALL_LON = 73.850601;
const MAX_DISTANCE_METERS = 150000;

function getDistanceFromLatLonInMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000; 
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function ensureAuth(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ message: 'Unauthorized' });
}

router.get('/', ensureAuth, async (req, res) => {
  if (req.user.role === 'admin') {
    return res.status(403).json({ message: 'Admins should use the admin dashboard to view seat data.' });
  }

  // Clean up expired bookings
  const now = new Date();
  const expiredBookings = await Booking.find({ endTime: { $lt: now }, status: 'active' }).populate('seat');
  for (const booking of expiredBookings) {
    booking.status = 'expired';
    await booking.save();
    if (booking.seat) {
      booking.seat.status = 'available';
      await booking.seat.save();
    }
  }
  const seats = await Seat.find();
  res.json(seats);
});

router.post('/book', ensureAuth, async (req, res) => {
  if (req.user.role === 'admin') {
    return res.status(403).json({ message: 'Admins cannot book seats. Please use the admin dashboard.' });
  }

  const { seatId, duration, userLat, userLon } = req.body;
  if (!seatId || !duration || !userLat || !userLon) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  
  const distance = getDistanceFromLatLonInMeters(userLat, userLon, HALL_LAT, HALL_LON);
  console.log('User location:', userLat, userLon);
  console.log('Hall location:', HALL_LAT, HALL_LON);
  console.log('Distance (meters):', distance);
  if (distance > MAX_DISTANCE_METERS) {
    return res.status(403).json({ message: 'You must be inside the reading hall to book a seat.' });
  }
  
  const activeBooking = await Booking.findOne({ user: req.user._id, status: 'active' });
  if (activeBooking) {
    return res.status(409).json({ message: 'You already have an active booking.' });
  }
  
  const seat = await Seat.findOne({ seatId });
  if (!seat || seat.status === 'booked') {
    return res.status(409).json({ message: 'Seat is not available.' });
  }
  
  const now = new Date();
  const endTime = new Date(now.getTime() + Math.min(duration, 6) * 60 * 60 * 1000);
  const booking = await Booking.create({
    user: req.user._id,
    seat: seat._id,
    startTime: now,
    endTime,
    status: 'active'
  });
  seat.status = 'booked';
  await seat.save();
  res.json({ message: 'Seat booked successfully', booking });
});

router.post('/cancel', ensureAuth, async (req, res) => {
  if (req.user.role === 'admin') {
    return res.status(403).json({ message: 'Admins cannot cancel bookings. Please use the admin dashboard.' });
  }

  const booking = await Booking.findOne({ user: req.user._id, status: 'active' }).populate('seat');
  if (!booking) {
    return res.status(404).json({ message: 'No active booking found.' });
  }
  booking.status = 'cancelled';
  await booking.save();
  booking.seat.status = 'available';
  await booking.seat.save();
  res.json({ message: 'Booking cancelled.' });
});

module.exports = router; 