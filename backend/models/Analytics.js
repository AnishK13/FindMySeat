const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  totalBookings: { type: Number, default: 0 },
  activeBookings: { type: Number, default: 0 },
  totalUsers: { type: Number, default: 0 },
  peakHour: { type: Number, default: 0 },
  peakHourBookings: { type: Number, default: 0 },
  averageSessionDuration: { type: Number, default: 0 },
  occupancyRate: { type: Number, default: 0 },
  cancelledBookings: { type: Number, default: 0 },
  revenue: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

analyticsSchema.index({ date: 1 });

module.exports = mongoose.model('Analytics', analyticsSchema); 