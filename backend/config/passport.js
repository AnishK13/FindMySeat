const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails[0].value;
    
    let user = await User.findOne({ googleId: profile.id });
    
    if (!user) {
      // Check if user should be admin
      const isAdmin = email === 'admin@findmyseat.com' || 
                     email.endsWith('@admin.findmyseat.com') ||
                     email === 'anishkhachane2004@gmail.com';
      
      user = await User.create({
        googleId: profile.id,
        email,
        name: profile.displayName,
        role: isAdmin ? 'admin' : 'student',
        lastLogin: new Date()
      });
    } else {
      user.lastLogin = new Date();
      
      // Update role if needed
      const isAdmin = email === 'admin@findmyseat.com' || 
                     email.endsWith('@admin.findmyseat.com') ||
                     email === 'anishkhachane2004@gmail.com';
      
      if (isAdmin && user.role !== 'admin') {
        user.role = 'admin';
      }
      
      await user.save();
    }
    
    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport; 