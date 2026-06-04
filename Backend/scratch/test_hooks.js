const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const TopupPackage = require('../src/modules/wallet/topupPackage.model');

async function runTest() {
  console.log('Connecting to database...');
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to Database successfully!');

  // Cleanup test documents
  await TopupPackage.deleteMany({ name: { $in: ['Test Map Package', 'Test Legacy Package'] } });

  console.log('\n--- Test 1: Saving a package with creditsMap ---');
  const pkgMap = new TopupPackage({
    name: 'Test Map Package',
    price: 99,
    creditsMap: {
      SMS: 120,
      EMAIL: 340
    }
  });

  await pkgMap.save();
  console.log('Saved Package successfully.');

  // Fetch from DB to see if legacy fields were automatically populated by pre('save')
  const fetchedMap = await TopupPackage.findOne({ name: 'Test Map Package' });
  console.log('Fetched package values from DB:');
  console.log('  service:', fetchedMap.service);
  console.log('  credits (total):', fetchedMap.credits);
  console.log('  creditsMap:', Object.fromEntries(fetchedMap.creditsMap));

  if (fetchedMap.credits === 460) {
    console.log('✅ Test 1 Passed: Legacy credits field populated (120 SMS + 340 Email = 460 total).');
  } else {
    console.log('❌ Test 1 Failed: Legacy credits mismatch. Expected 460, got', fetchedMap.credits);
  }

  console.log('\n--- Test 2: Simulating legacy package migration via post-init ---');
  // Insert directly as raw object bypass Mongoose validations/pre-save hooks to simulate an existing legacy document
  await TopupPackage.collection.insertOne({
    name: 'Test Legacy Package',
    service: 'EMAIL',
    credits: 500,
    price: 150,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  // Query it back through Mongoose model, triggering the post-init hook
  const fetchedLegacy = await TopupPackage.findOne({ name: 'Test Legacy Package' });
  console.log('Fetched legacy package via Mongoose:');
  console.log('  service:', fetchedLegacy.service);
  console.log('  credits:', fetchedLegacy.credits);
  console.log('  creditsMap:', fetchedLegacy.creditsMap ? Object.fromEntries(fetchedLegacy.creditsMap) : 'undefined');

  const legacyEmailVal = fetchedLegacy.creditsMap ? fetchedLegacy.creditsMap.get('EMAIL') : 0;
  if (legacyEmailVal === 500) {
    console.log('✅ Test 2 Passed: Legacy document successfully migrated to creditsMap at load time.');
  } else {
    console.log('❌ Test 2 Failed: Legacy migration failed. Expected EMAIL: 500, got:', legacyEmailVal);
  }

  // Cleanup test documents
  await TopupPackage.deleteMany({ name: { $in: ['Test Map Package', 'Test Legacy Package'] } });
  
  console.log('\nClosing DB connection...');
  await mongoose.disconnect();
  console.log('DB disconnected. Test complete!');
}

runTest().catch(err => {
  console.error('Test errored out:', err);
  mongoose.disconnect();
});
