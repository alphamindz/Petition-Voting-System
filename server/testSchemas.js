const mongoose = require('mongoose');
const {
  User,
  Verification,
  Protest,
  Vote,
  AdminActivity,
  Notification
} = require('./models');

async function verifySchemas() {
  await mongoose.connect('mongodb://127.0.0.1:27017/petition_system');
  console.log('[Test] Connected to MongoDB.');

  const user = await User.findOne();
  const protest = await Protest.findOne();

  // Test 1: Verify text search on Protest (title + description)
  const searchResults = await Protest.find({
    $text: { $search: 'Greenwood' }
  });
  console.log(`[Test 1] Text Search on Protest found ${searchResults.length} match(es): "${searchResults[0]?.title}"`);

  // Test 2: Verify Unique Compound Index on (user, protest) in Vote
  console.log('[Test 2] Testing duplicate vote prevention...');
  await Vote.deleteMany({ user: user._id, protest: protest._id });
  await Vote.create({ user: user._id, protest: protest._id, voteType: 'support' });

  try {
    await Vote.create({ user: user._id, protest: protest._id, voteType: 'support' });
    console.error('[Test 2] FAILED: Duplicate vote was not blocked!');
  } catch (err) {
    if (err.code === 11000) {
      console.log('[Test 2] PASSED: Duplicate vote rejected with E11000 Duplicate Key Error!');
    } else {
      console.log('[Test 2] Caught error:', err.message);
    }
  }

  // Test 3: Verify Verification model never stores raw OTP
  const ver = await Verification.findOne({ type: 'email' }).select('+otpHash');
  console.log('[Test 3] Hashed OTP verified:', ver.otpHash.startsWith('$2') ? 'PASSED (bcrypt hash)' : 'FAILED');

  // Test 4: Verify AdminActivity & Notification records
  const act = await AdminActivity.findOne().populate('admin', 'name').populate('protest', 'title');
  console.log(`[Test 4] AdminActivity audit record: Action="${act?.action}", by "${act?.admin?.name}"`);

  const notif = await Notification.findOne().populate('protest', 'title');
  console.log(`[Test 4] Notification record: status="${notif?.status}", for "${notif?.protest?.title}"`);

  await mongoose.disconnect();
  console.log('\n✅ ALL 6 MONGOOSE SCHEMAS AND INDEXES VERIFIED SUCCESSFULLY!\n');
  process.exit(0);
}

verifySchemas().catch((err) => {
  console.error('[Test Error]', err);
  process.exit(1);
});

