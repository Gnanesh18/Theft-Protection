const mongoose = require('mongoose');
const dbManager = require('../services/dbManager');

const seedMongoData = async () => {
  try {
    const User = require('../models/User');
    const Case = require('../models/Case');
    const Notification = require('../models/Notification');
    const SystemLog = require('../models/SystemLog');

    // Database cleanup disabled to keep persistent user, case, and notification records
    console.log('MongoDB: Persistent mode active. No data will be cleared on startup.');

    // Ensure admin user exists
    const bcrypt = require('bcryptjs');
    const salt = bcrypt.genSaltSync(10);
    const adminPassword = bcrypt.hashSync('admin', salt);

    const adminExists = await User.findOne({ email: 'admin' });
    if (!adminExists) {
      await User.create({
        name: 'Command Admin',
        email: 'admin',
        password: adminPassword,
        role: 'admin',
        phoneNumber: '911-000-0001',
        isActive: true
      });
      console.log('MongoDB: Admin user seeded successfully.');
    } else {
      adminExists.password = adminPassword;
      await adminExists.save();
      console.log('MongoDB: Admin credentials verified.');
    }
  } catch (err) {
    console.error('MongoDB cleanup/seeding error:', err.message);
  }
};

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/theft_protection';
  console.log(`Connecting to MongoDB at: ${mongoURI.replace(/:([^:@]+)@/, ':****@')}`);
  
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 3000
    });
    console.log('MongoDB Connected Successfully.');
    dbManager.setMongoConnected(true);
    // Seed data
    await seedMongoData();
  } catch (err) {
    console.error(`MongoDB Connection Failed: ${err.message}`);
    console.log('Initiating fallback to Local JSON File Database...');
    dbManager.setMongoConnected(false);
  }
};

module.exports = connectDB;
