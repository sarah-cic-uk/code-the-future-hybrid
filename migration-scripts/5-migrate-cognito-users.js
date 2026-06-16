/**
 * Step 5: Migrate Users to Cognito
 * 
 * This script creates users in AWS Cognito User Pool.
 * 
 * IMPORTANT: Passwords cannot be migrated from Firebase to Cognito.
 * Users will need to reset their passwords on first login.
 * 
 * Prerequisites:
 * - Cognito User Pool created (run 3-create-aws-resources.js first)
 * - COGNITO_USER_POOL_ID set in .env file
 * 
 * Usage: node 5-migrate-cognito-users.js
 */

require('dotenv').config();
const admin = require('firebase-admin');
const {
  CognitoIdentityProviderClient,
  AdminCreateUserCommand,
  AdminAddUserToGroupCommand,
  AdminSetUserPasswordCommand
} = require('@aws-sdk/client-cognito-identity-provider');
const fs = require('fs');
const path = require('path');

const region = process.env.AWS_REGION || 'eu-west-2';
const userPoolId = process.env.COGNITO_USER_POOL_ID;

if (!userPoolId) {
  console.error('❌ Error: COGNITO_USER_POOL_ID not set in .env file');
  console.log('Run: node 3-create-aws-resources.js first and update .env');
  process.exit(1);
}

const cognitoClient = new CognitoIdentityProviderClient({ region });

// Initialize Firebase Admin to get auth users
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const exportDir = path.join(__dirname, 'export');

async function migrateUser(firebaseUser, userData) {
  try {
    // Create user in Cognito
    const createCommand = new AdminCreateUserCommand({
      UserPoolId: userPoolId,
      Username: firebaseUser.email,
      UserAttributes: [
        { Name: 'email', Value: firebaseUser.email },
        { Name: 'email_verified', Value: 'true' },
        { Name: 'name', Value: firebaseUser.displayName || firebaseUser.email }
      ],
      MessageAction: 'SUPPRESS', // Don't send welcome email
      TemporaryPassword: generateTemporaryPassword()
    });

    await cognitoClient.send(createCommand);

    // Set permanent password (users will still need to change it on first login)
    const setPasswordCommand = new AdminSetUserPasswordCommand({
      UserPoolId: userPoolId,
      Username: firebaseUser.email,
      Password: generateTemporaryPassword(),
      Permanent: false // Force password change on first login
    });

    await cognitoClient.send(setPasswordCommand);

    // Add user to appropriate group
    let groupName = 'Students';
    if (userData.tutor) {
      groupName = 'Tutors';
    } else if (userData.teacher) {
      groupName = 'Teachers';
    }

    const addToGroupCommand = new AdminAddUserToGroupCommand({
      UserPoolId: userPoolId,
      Username: firebaseUser.email,
      GroupName: groupName
    });

    await cognitoClient.send(addToGroupCommand);

    return { success: true, email: firebaseUser.email, group: groupName };

  } catch (error) {
    if (error.name === 'UsernameExistsException') {
      return { success: false, email: firebaseUser.email, error: 'Already exists' };
    }
    return { success: false, email: firebaseUser.email, error: error.message };
  }
}

function generateTemporaryPassword() {
  // Generate a random temporary password that meets Cognito requirements
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password + '1!'; // Add number and special char to meet policy
}

async function migrateAllUsers() {
  console.log('🚀 Starting Cognito user migration...\n');
  console.log(`📍 Region: ${region}`);
  console.log(`👤 User Pool: ${userPoolId}\n`);

  try {
    // Get Firebase auth users
    console.log('📦 Fetching Firebase auth users...');
    const listUsersResult = await admin.auth().listUsers();
    const firebaseUsers = listUsersResult.users;
    console.log(`✅ Found ${firebaseUsers.length} Firebase auth users\n`);

    // Load user data from export
    const usersData = JSON.parse(
      fs.readFileSync(path.join(exportDir, 'users.json'), 'utf8')
    );

    // Migrate each user
    console.log('👥 Migrating users to Cognito...\n');
    
    const results = {
      success: [],
      failed: [],
      skipped: []
    };

    for (let i = 0; i < firebaseUsers.length; i++) {
      const firebaseUser = firebaseUsers[i];
      const userData = usersData[firebaseUser.uid] || {};

      process.stdout.write(`\r   Processing ${i + 1}/${firebaseUsers.length}: ${firebaseUser.email}...`);

      const result = await migrateUser(firebaseUser, userData);

      if (result.success) {
        results.success.push(result);
      } else if (result.error === 'Already exists') {
        results.skipped.push(result);
      } else {
        results.failed.push(result);
      }

      // Small delay to avoid throttling
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('\n'); // New line after progress

    // Print summary
    console.log('✨ Migration complete!\n');
    console.log('📊 Summary:');
    console.log(`   ✅ Successfully migrated: ${results.success.length}`);
    console.log(`   ⏭️  Skipped (already exist): ${results.skipped.length}`);
    console.log(`   ❌ Failed: ${results.failed.length}`);

    if (results.failed.length > 0) {
      console.log('\n❌ Failed users:');
      results.failed.forEach(r => {
        console.log(`   - ${r.email}: ${r.error}`);
      });
    }

    // Save migration report
    const report = {
      migrationDate: new Date().toISOString(),
      userPoolId: userPoolId,
      totalUsers: firebaseUsers.length,
      results: results
    };

    fs.writeFileSync(
      path.join(exportDir, 'cognito-migration-report.json'),
      JSON.stringify(report, null, 2)
    );

    console.log('\n📝 Migration report saved to: export/cognito-migration-report.json');

    console.log('\n⚠️  IMPORTANT NOTES:');
    console.log('1. Passwords were NOT migrated (not possible with Cognito)');
    console.log('2. All users must reset their password on first login');
    console.log('3. Send password reset emails to all users');
    console.log('4. Users are assigned to groups: Students, Teachers, or Tutors');

    console.log('\n📝 Next steps:');
    console.log('1. Run: bash 6-migrate-storage.sh');
    console.log('2. Send password reset emails to all users');
    console.log('3. Update application code to use Cognito');

  } catch (error) {
    console.error('\n❌ Error migrating users:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Run migration
migrateAllUsers();

// Made with Bob
