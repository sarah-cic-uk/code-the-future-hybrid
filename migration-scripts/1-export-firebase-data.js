/**
 * Step 1: Export Firebase Data
 * 
 * This script exports all data from Firebase Realtime Database to JSON files.
 * 
 * Prerequisites:
 * - Place serviceAccountKey.json in this directory
 * - Run: npm install
 * 
 * Usage: node 1-export-firebase-data.js
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://code-the-future-hybrid-default-rtdb.europe-west1.firebasedatabase.app/'
});

const db = admin.database();

// Create export directory if it doesn't exist
const exportDir = path.join(__dirname, 'export');
if (!fs.existsSync(exportDir)) {
  fs.mkdirSync(exportDir, { recursive: true });
}

async function exportData() {
  console.log('🚀 Starting Firebase data export...\n');

  try {
    // Export users
    console.log('📦 Exporting users...');
    const usersSnapshot = await db.ref('users').once('value');
    const users = usersSnapshot.val() || {};
    const userCount = Object.keys(users).length;
    fs.writeFileSync(
      path.join(exportDir, 'users.json'),
      JSON.stringify(users, null, 2)
    );
    console.log(`✅ Exported ${userCount} users\n`);

    // Export cohorts
    console.log('📦 Exporting cohorts...');
    const cohortsSnapshot = await db.ref('cohorts').once('value');
    const cohorts = cohortsSnapshot.val() || {};
    const cohortCount = Object.keys(cohorts).length;
    fs.writeFileSync(
      path.join(exportDir, 'cohorts.json'),
      JSON.stringify(cohorts, null, 2)
    );
    console.log(`✅ Exported ${cohortCount} cohorts\n`);

    // Export session requests
    console.log('📦 Exporting session requests...');
    const requestsSnapshot = await db.ref('sessionRequests').once('value');
    const requests = requestsSnapshot.val() || {};
    const requestCount = Object.keys(requests).length;
    fs.writeFileSync(
      path.join(exportDir, 'sessionRequests.json'),
      JSON.stringify(requests, null, 2)
    );
    console.log(`✅ Exported ${requestCount} session requests\n`);

    // Export tutor availability (nested in users)
    console.log('📦 Extracting tutor availability...');
    const availability = {};
    for (const [userId, userData] of Object.entries(users)) {
      if (userData.availability) {
        availability[userId] = userData.availability;
      }
    }
    const availabilityCount = Object.keys(availability).length;
    fs.writeFileSync(
      path.join(exportDir, 'tutorAvailability.json'),
      JSON.stringify(availability, null, 2)
    );
    console.log(`✅ Extracted availability for ${availabilityCount} tutors\n`);

    // Export booked sessions (nested in users)
    console.log('📦 Extracting booked sessions...');
    const bookedSessions = {};
    for (const [userId, userData] of Object.entries(users)) {
      if (userData.bookedSessions) {
        bookedSessions[userId] = userData.bookedSessions;
      }
    }
    const bookedCount = Object.keys(bookedSessions).length;
    fs.writeFileSync(
      path.join(exportDir, 'bookedSessions.json'),
      JSON.stringify(bookedSessions, null, 2)
    );
    console.log(`✅ Extracted booked sessions for ${bookedCount} tutors\n`);

    // Export requested sessions (nested in users)
    console.log('📦 Extracting requested sessions...');
    const requestedSessions = {};
    for (const [userId, userData] of Object.entries(users)) {
      if (userData.requestedSessions) {
        requestedSessions[userId] = userData.requestedSessions;
      }
    }
    const requestedCount = Object.keys(requestedSessions).length;
    fs.writeFileSync(
      path.join(exportDir, 'requestedSessions.json'),
      JSON.stringify(requestedSessions, null, 2)
    );
    console.log(`✅ Extracted requested sessions for ${requestedCount} tutors\n`);

    // Create summary
    const summary = {
      exportDate: new Date().toISOString(),
      counts: {
        users: userCount,
        cohorts: cohortCount,
        sessionRequests: requestCount,
        tutorsWithAvailability: availabilityCount,
        tutorsWithBookedSessions: bookedCount,
        tutorsWithRequestedSessions: requestedCount
      }
    };

    fs.writeFileSync(
      path.join(exportDir, 'export-summary.json'),
      JSON.stringify(summary, null, 2)
    );

    console.log('✨ Export complete!');
    console.log(`📁 Data saved to: ${exportDir}`);
    console.log('\n📊 Summary:');
    console.log(JSON.stringify(summary.counts, null, 2));

  } catch (error) {
    console.error('❌ Error exporting data:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Run export
exportData();

// Made with Bob
