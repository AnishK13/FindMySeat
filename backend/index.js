require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('./config/passport');
const seatsRoutes = require('./routes/seats');
const adminRoutes = require('./routes/admin');
const http = require('http');
const moment = require('moment');

const app = express();
const server = http.createServer(app);

app.set('trust proxy', 1);
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    sameSite: 'lax',
    secure: false
  }
}));
app.use(passport.initialize());
app.use(passport.session());

// SSE: keep track of admin and student listeners
const adminSseClients = new Set();
const studentSseClients = new Set();

app.get('/events/admin', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.flushHeaders && res.flushHeaders();

  // Initial comment to establish stream
  res.write(': connected\n\n');
  adminSseClients.add(res);

  req.on('close', () => {
    adminSseClients.delete(res);
    try { res.end(); } catch (_) {}
  });
});

app.get('/events/seats', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.flushHeaders && res.flushHeaders();

  res.write(': connected\n\n');
  studentSseClients.add(res);

  req.on('close', () => {
    studentSseClients.delete(res);
    try { res.end(); } catch (_) {}
  });
});

// Send real-time analytics updates
const emitAnalyticsUpdate = async () => {
  try {
    const Booking = require('./models/Booking');
    const Seat = require('./models/Seat');
    const User = require('./models/User');
    
    const activeBookings = await Booking.find({
      status: 'active',
      endTime: { $gt: new Date() }
    });
    
    const totalSeats = await Seat.countDocuments();
    const occupancyRate = totalSeats > 0 ? (activeBookings.length / totalSeats) * 100 : 0;
    
    const analyticsData = {
      activeBookings: activeBookings.length,
      occupancyRate: Math.round(occupancyRate * 10) / 10,
      timestamp: new Date()
    };
    
    // Broadcast to all connected SSE admin clients
    const payload = `data: ${JSON.stringify(analyticsData)}\n\n`;
    for (const client of adminSseClients) {
      try {
        client.write(payload);
      } catch (err) {
        // Drop broken client
        adminSseClients.delete(client);
        try { client.end(); } catch (_) {}
      }
    }
  } catch (error) {
    console.error('Error emitting analytics update:', error);
  }
};

setInterval(emitAnalyticsUpdate, 30000);

// Heartbeat to keep connections alive through proxies
setInterval(() => {
  for (const client of adminSseClients) {
    try { client.write(': heartbeat\n\n'); } catch (_) {}
  }
}, 25000);

app.get('/', (req, res) => {
  res.send('FindMySeat backend is running!');
});

app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/fail' }),
  (req, res) => {
    req.login(req.user, function(err) {
      if (err) { return res.redirect('http://localhost:3000?error=login'); }
      return res.redirect('http://localhost:3000');
    });
  }
);

app.get('/fail', (req, res) => res.send('Google OAuth failed'));

app.get('/profile', (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  res.json({ user: req.user });
});

app.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: 'Error during logout' });
    }
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: 'Error destroying session' });
      }
      res.clearCookie('connect.sid');
      res.json({ message: 'Logged out successfully' });
    });
  });
});

app.use('/api/seats', seatsRoutes);
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 