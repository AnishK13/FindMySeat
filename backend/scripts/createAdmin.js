require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

async function createAdminUser() {
  try {
    const existingAdmin = await User.findOne({ email: 'admin@findmyseat.com' });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }

    const adminUser = new User({
      googleId: 'admin_google_id',
      email: 'admin@findmyseat.com',
      name: 'System Administrator',
      role: 'admin',
      isActive: true
    });

    await adminUser.save();
    console.log('Admin user created successfully');
    console.log('Email: admin@findmyseat.com');
    console.log('Role: admin');
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    mongoose.connection.close();
  }
}

createAdminUser(); 