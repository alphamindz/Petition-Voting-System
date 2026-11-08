const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

const {
  User,
  Verification,
  Protest,
  Vote,
  AdminActivity,
  Notification,
  Petition
} = require('../models');

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/petition_system');
    console.log('[Seeder] Connected to MongoDB...');

    // Clear existing collections
    await Promise.all([
      User.deleteMany({}),
      Verification.deleteMany({}),
      Protest.deleteMany({}),
      Vote.deleteMany({}),
      AdminActivity.deleteMany({}),
      Notification.deleteMany({}),
      Petition.deleteMany({})
    ]);
    console.log('[Seeder] Cleared existing data.');

    const defaultSalt = await bcrypt.genSalt(10);
    const defaultHash = await bcrypt.hash('password123', defaultSalt);

    // 1. Create Users
    const sampleUsers = [
      {
        name: 'Admin Officer',
        email: 'admin@petitionsystem.org',
        mobile: '+919876543210',
        passwordHash: defaultHash,
        role: 'admin',
        isEmailVerified: true,
        isAadhaarVerified: true,
        isActive: true
      },
      {
        name: 'Elena Rostova',
        email: 'elena@example.com',
        mobile: '+919876543211',
        passwordHash: defaultHash,
        role: 'user',
        isEmailVerified: true,
        isAadhaarVerified: true,
        isActive: true
      },
      {
        name: 'Marcus Chen',
        email: 'marcus@example.com',
        mobile: '+919876543212',
        passwordHash: defaultHash,
        role: 'user',
        isEmailVerified: true,
        isAadhaarVerified: false,
        isActive: true
      },
      {
        name: 'Sarah Jenkins',
        email: 'sarah@example.com',
        mobile: '+919876543213',
        passwordHash: defaultHash,
        role: 'user',
        isEmailVerified: false,
        isAadhaarVerified: false,
        isActive: true
      }
    ];

    const users = await User.insertMany(sampleUsers);
    console.log(`[Seeder] Created ${users.length} users with passwordHash & mobile.`);
    const [admin, elena, marcus, sarah] = users;

    // 2. Create Verifications (Never storing raw Aadhaar or raw OTPs)
    const sampleVerifications = [
      {
        user: elena._id,
        type: 'email',
        status: 'verified',
        referenceId: 'ref_email_elena_001',
        otpHash: await bcrypt.hash('849201', 10), // hashed OTP
        otpExpiresAt: new Date(Date.now() + 3600000),
        attempts: 1,
        verifiedAt: new Date()
      },
      {
        user: elena._id,
        type: 'aadhaar',
        status: 'verified',
        referenceId: 'ekyc_txn_masked_xxxx9012', // Masked reference token, NEVER raw Aadhaar
        attempts: 1,
        verifiedAt: new Date()
      },
      {
        user: marcus._id,
        type: 'mobile',
        status: 'pending',
        referenceId: 'ref_mob_marcus_002',
        otpHash: await bcrypt.hash('194820', 10), // hashed OTP
        otpExpiresAt: new Date(Date.now() + 600000),
        attempts: 0
      }
    ];

    await Verification.insertMany(sampleVerifications);
    console.log(`[Seeder] Seeded ${sampleVerifications.length} verifications.`);

    // 3. Create Protests
    const sampleProtests = [
      {
        user: elena._id,
        title: 'Preserve Greenwood Heritage Forest from Commercial Encroachment',
        description:
          'Greenwood Forest is home to over 140 species of native birds and vital wetlands safeguarding regional water reserves. The zoning council approved a 45-hectare commercial zoning amendment.',
        concernedAuthority: 'State Department of Forestry & City Planning Commission',
        supportingInfo: 'Environmental Impact Assessment 2025; Water Table Survey Report #14.',
        status: 'published',
        voteCount: 2
      },
      {
        user: marcus._id,
        title: 'Universal High-Speed Internet Access for Public School Students',
        description:
          'Thousands of underprivileged students fall behind on coursework and tutoring because their families cannot afford private broadband rates. Municipal subsidized fiber vouchers are urgently requested.',
        concernedAuthority: 'Department of Public Education & Telecommunications Bureau',
        supportingInfo: 'Digital Divide Statistics Report 2024-2025.',
        status: 'published',
        voteCount: 1
      },
      {
        user: sarah._id,
        title: 'Enact Humane No-Kill Protocol at Municipal Animal Shelter Facilities',
        description:
          'Shelter overcrowding results in unnecessary euthanasia of healthy adoptable animals. Mobile adoption programs and foster subsidies can achieve a 90%+ live release standard.',
        concernedAuthority: 'City Animal Services Directorate',
        supportingInfo: 'Best practices handbook from the Humane Society.',
        status: 'approved',
        voteCount: 0
      }
    ];

    const protests = await Protest.insertMany(sampleProtests);
    console.log(`[Seeder] Seeded ${protests.length} protests with text search indexes.`);
    const [p1, p2] = protests;

    // 4. Create Votes (Unique compound index on user and protest)
    const sampleVotes = [
      { user: elena._id, protest: p1._id, voteType: 'support' },
      { user: marcus._id, protest: p1._id, voteType: 'support' },
      { user: elena._id, protest: p2._id, voteType: 'support' }
    ];

    await Vote.insertMany(sampleVotes);
    console.log(`[Seeder] Seeded ${sampleVotes.length} votes with unique user-protest index.`);

    // 5. Create AdminActivity
    await AdminActivity.create({
      admin: admin._id,
      protest: p1._id,
      action: 'published',
      notes: 'Reviewed civic authenticity and verified compliance with local guidelines.'
    });
    console.log('[Seeder] Seeded AdminActivity audit log.');

    // 6. Create Notification
    await Notification.create({
      recipient: elena._id,
      protest: p1._id,
      status: 'sent',
      message: 'Your protest has been reviewed and officially published!'
    });
    console.log('[Seeder] Seeded Notification.');

    // Seed Petitions for the frontend UI as well
    await Petition.insertMany([
      {
        title: 'Preserve the Greenwood Heritage Forest from Commercial Development',
        description:
          'Greenwood Forest is home to over 140 species of native birds and vital wetlands safeguarding regional water reserves. The local zoning council recently approved commercial encroachment.',
        category: 'Environment',
        targetSignatures: 500,
        imageUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800',
        creator: elena._id,
        currentSignatures: 2,
        status: 'active',
        signatures: [
          { user: elena._id, name: elena.name, comment: 'Clean air and green trees for our children.' },
          { user: marcus._id, name: marcus.name, comment: 'Urban development must not destroy our heritage.' }
        ]
      },
      {
        title: 'Provide Universal Free High-Speed Internet to All Public School Students',
        description:
          'In modern education, reliable internet access is no longer a luxury—it is fundamental infrastructure. We petition the Department of Education to establish broadband vouchers.',
        category: 'Education',
        targetSignatures: 250,
        imageUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800',
        creator: marcus._id,
        currentSignatures: 1,
        status: 'active',
        signatures: [
          { user: marcus._id, name: marcus.name, comment: 'Equal digital access is equal opportunity.' }
        ]
      }
    ]);
    console.log('[Seeder] Seeded UI Petitions.');

    console.log('\n[Seeder] ✅ All 6 Mongoose Schemas Seeded & Verified successfully!');
    process.exit(0);
  } catch (error) {
    console.error('[Seeder] Error during seeding:', error);
    process.exit(1);
  }
};

seedData();
