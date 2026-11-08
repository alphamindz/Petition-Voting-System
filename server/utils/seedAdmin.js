const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

dotenv.config();

const seedAdmin = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/petition_system';
    await mongoose.connect(mongoUri);
    console.log('[SeedAdmin] Connected to MongoDB...');

    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@petitionsystem.org').toLowerCase().trim();
    const adminPassword = 'AdminPassword@2025!';

    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log(`[SeedAdmin] Administrator (${adminEmail}) already exists.`);
      console.log(`[SeedAdmin] Role: ${existingAdmin.role}, Active: ${existingAdmin.isActive}`);
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(adminPassword, salt);

    const admin = await User.create({
      name: 'System Administrator',
      email: adminEmail,
      mobile: '+919876543200',
      passwordHash,
      role: 'admin',
      isEmailVerified: true,
      isAadhaarVerified: true,
      isActive: true,
      bio: 'Principal System Administrator for Civic Petition & Protest Review'
    });

    console.log('\n============================================================');
    console.log('✅ FIRST ADMIN USER CREATED SUCCESSFULLY');
    console.log('============================================================');
    console.log(`Name:     ${admin.name}`);
    console.log(`Email:    ${admin.email}`);
    console.log(`Password: ${adminPassword}`);
    console.log(`Role:     ${admin.role}`);
    console.log('============================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('[SeedAdmin Error]:', error.message);
    process.exit(1);
  }
};

seedAdmin();

