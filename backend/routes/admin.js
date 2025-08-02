const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Booking = require('../models/Booking');
const Seat = require('../models/Seat');
const Analytics = require('../models/Analytics');
const moment = require('moment');
const _ = require('lodash');

function ensureAdmin(req, res, next) {
  if (req.isAuthenticated() && req.user.role === 'admin') {
    return next();
  }
  res.status(403).json({ message: 'Admin access required' });
}

router.get('/dashboard', ensureAdmin, async (req, res) => {
  try {
    const today = moment().startOf('day');
    const weekAgo = moment().subtract(7, 'days');
    
    const todayBookings = await Booking.find({
      startTime: { $gte: today.toDate() }
    });
    
    const activeBookings = await Booking.find({
      status: 'active',
      endTime: { $gt: new Date() }
    });
    
    const totalUsers = await User.countDocuments({ role: 'student' });
    
    const weeklyBookings = await Booking.find({
      startTime: { $gte: weekAgo.toDate() }
    });
    
    const hourlyData = _.range(0, 24).map(hour => {
      const hourBookings = todayBookings.filter(booking => 
        moment(booking.startTime).hour() === hour
      );
      return { hour, count: hourBookings.length };
    });
    
    const peakHourData = _.maxBy(hourlyData, 'count');
    
    const completedBookings = await Booking.find({
      status: 'expired',
      startTime: { $gte: weekAgo.toDate() }
    });
    
    const avgDuration = completedBookings.length > 0 
      ? completedBookings.reduce((sum, booking) => {
          const duration = moment(booking.endTime).diff(moment(booking.startTime), 'hours');
          return sum + duration;
        }, 0) / completedBookings.length
      : 0;
    
    const totalSeats = await Seat.countDocuments();
    const occupancyRate = totalSeats > 0 ? (activeBookings.length / totalSeats) * 100 : 0;
    
    const weeklyTrend = await Promise.all(
      _.range(7).map(async (dayOffset) => {
        const date = moment().subtract(dayOffset, 'days');
        const dayBookings = await Booking.countDocuments({
          startTime: {
            $gte: date.startOf('day').toDate(),
            $lt: date.endOf('day').toDate()
          }
        });
        return {
          date: date.format('YYYY-MM-DD'),
          bookings: dayBookings
        };
      })
    );
    
    const topUsers = await User.aggregate([
      { $match: { role: 'student' } },
      { $sort: { totalBookings: -1 } },
      { $limit: 5 },
      { $project: { name: 1, totalBookings: 1, totalHours: 1 } }
    ]);
    
    const seatPopularity = await Booking.aggregate([
      { $match: { startTime: { $gte: weekAgo.toDate() } } },
      { $group: { _id: '$seat', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $lookup: { from: 'seats', localField: '_id', foreignField: '_id', as: 'seatInfo' } }
    ]);
    
    const dashboardData = {
      today: {
        totalBookings: todayBookings.length,
        activeBookings: activeBookings.length,
        totalUsers,
        peakHour: peakHourData.hour,
        peakHourBookings: peakHourData.count,
        averageSessionDuration: Math.round(avgDuration * 10) / 10,
        occupancyRate: Math.round(occupancyRate * 10) / 10
      },
      weekly: {
        trend: weeklyTrend.reverse(),
        totalBookings: weeklyBookings.length,
        topUsers,
        seatPopularity
      },
      hourlyDistribution: hourlyData
    };
    
    res.json(dashboardData);
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Error fetching dashboard data' });
  }
});

router.get('/users', ensureAdmin, async (req, res) => {
  try {
    const users = await User.find({ role: 'student' })
      .select('-googleId')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
});

router.get('/bookings', ensureAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const query = {};
    if (status) query.status = status;
    
    const bookings = await Booking.find(query)
      .populate('user', 'name email')
      .populate('seat', 'seatId position')
      .sort({ startTime: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Booking.countDocuments(query);
    
    res.json({
      bookings,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bookings' });
  }
});

router.post('/users/:id/toggle', ensureAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.isActive = !user.isActive;
    await user.save();
    
    res.json({ message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully` });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user status' });
  }
});

router.get('/analytics/export', ensureAdmin, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = {};
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const analytics = await Analytics.find(query).sort({ date: 1 });
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ message: 'Error exporting analytics' });
  }
});

module.exports = router; 