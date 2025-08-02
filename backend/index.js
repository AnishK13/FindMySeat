require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('./config/passport');
const seatsRoutes = require('./routes/seats');
const adminRoutes = require('./routes/admin');
const http = require('http');
const socketIo = require('socket.io');
const moment = require('moment');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

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

// Socket connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('join-admin', () => {
    socket.join('admin-room');
    console.log('Admin joined real-time updates');
  });
  
  socket.on('join-student', () => {
    socket.join('student-room');
    console.log('Student joined seat updates');
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
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
    
    io.to('admin-room').emit('analytics-update', analyticsData);
  } catch (error) {
    console.error('Error emitting analytics update:', error);
  }
};

setInterval(emitAnalyticsUpdate, 30000);

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