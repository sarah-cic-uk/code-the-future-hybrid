/**
 * Step 4: Import Data to DynamoDB
 * 
 * This script imports transformed data into DynamoDB tables.
 * 
 * Prerequisites:
 * - AWS resources created (run 3-create-aws-resources.js first)
 * - Data transformed (run 2-transform-data.js first)
 * 
 * Usage: node 4-import-to-dynamodb.js
 */

require('dotenv').config();
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, BatchWriteCommand } = require('@aws-sdk/lib-dynamodb');
const fs = require('fs');
const path = require('path');

const region = process.env.AWS_REGION || 'eu-west-2';
const client = new DynamoDBClient({ region });
const docClient = DynamoDBDocumentClient.from(client);

const exportDir = path.join(__dirname, 'export');

// Batch write helper (DynamoDB limit is 25 items per batch)
async function batchWrite(tableName, items) {
  const batchSize = 25;
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    
    try {
      const putRequests = batch.map(item => ({
        PutRequest: { Item: item }
      }));

      const command = new BatchWriteCommand({
        RequestItems: {
          [tableName]: putRequests
        }
      });

      await docClient.send(command);
      successCount += batch.length;
      
      // Progress indicator
      process.stdout.write(`\r   Imported ${successCount}/${items.length} items...`);
      
      // Small delay to avoid throttling
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.error(`\n   ❌ Error in batch ${i / batchSize + 1}:`, error.message);
      errorCount += batch.length;
    }
  }

  console.log(''); // New line after progress
  return { successCount, errorCount };
}

async function importUsers() {
  console.log('👥 Importing users...');
  
  try {
    const users = JSON.parse(
      fs.readFileSync(path.join(exportDir, 'dynamodb-users.json'), 'utf8')
    );

    const result = await batchWrite('CodeTheFuture-Users', users);
    console.log(`✅ Imported ${result.successCount} users`);
    
    if (result.errorCount > 0) {
      console.log(`⚠️  Failed to import ${result.errorCount} users`);
    }
  } catch (error) {
    console.error('❌ Error importing users:', error.message);
  }
}

async function importCohorts() {
  console.log('\n📚 Importing cohorts...');
  
  try {
    const cohorts = JSON.parse(
      fs.readFileSync(path.join(exportDir, 'dynamodb-cohorts.json'), 'utf8')
    );

    const result = await batchWrite('CodeTheFuture-Cohorts', cohorts);
    console.log(`✅ Imported ${result.successCount} cohorts`);
    
    if (result.errorCount > 0) {
      console.log(`⚠️  Failed to import ${result.errorCount} cohorts`);
    }
  } catch (error) {
    console.error('❌ Error importing cohorts:', error.message);
  }
}

async function importAvailability() {
  console.log('\n📅 Importing tutor availability...');
  
  try {
    const availability = JSON.parse(
      fs.readFileSync(path.join(exportDir, 'dynamodb-availability.json'), 'utf8')
    );

    const result = await batchWrite('CodeTheFuture-TutorAvailability', availability);
    console.log(`✅ Imported ${result.successCount} availability slots`);
    
    if (result.errorCount > 0) {
      console.log(`⚠️  Failed to import ${result.errorCount} slots`);
    }
  } catch (error) {
    console.error('❌ Error importing availability:', error.message);
  }
}

async function importBookedSessions() {
  console.log('\n📝 Importing booked sessions...');
  
  try {
    const sessions = JSON.parse(
      fs.readFileSync(path.join(exportDir, 'dynamodb-sessions.json'), 'utf8')
    );

    const result = await batchWrite('CodeTheFuture-BookedSessions', sessions);
    console.log(`✅ Imported ${result.successCount} booked sessions`);
    
    if (result.errorCount > 0) {
      console.log(`⚠️  Failed to import ${result.errorCount} sessions`);
    }
  } catch (error) {
    console.error('❌ Error importing booked sessions:', error.message);
  }
}

async function importSessionRequests() {
  console.log('\n📬 Importing session requests...');
  
  try {
    const requests = JSON.parse(
      fs.readFileSync(path.join(exportDir, 'dynamodb-requests.json'), 'utf8')
    );

    const result = await batchWrite('CodeTheFuture-SessionRequests', requests);
    console.log(`✅ Imported ${result.successCount} session requests`);
    
    if (result.errorCount > 0) {
      console.log(`⚠️  Failed to import ${result.errorCount} requests`);
    }
  } catch (error) {
    console.error('❌ Error importing session requests:', error.message);
  }
}

async function importAllData() {
  console.log('🚀 Starting DynamoDB data import...\n');
  console.log(`📍 Region: ${region}\n`);

  const startTime = Date.now();

  try {
    await importUsers();
    await importCohorts();
    await importAvailability();
    await importBookedSessions();
    await importSessionRequests();

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log('\n✨ Data import complete!');
    console.log(`⏱️  Total time: ${duration} seconds`);
    console.log('\n📝 Next steps:');
    console.log('1. Run: node 5-migrate-cognito-users.js');
    console.log('2. Run: bash 6-migrate-storage.sh');

  } catch (error) {
    console.error('❌ Error importing data:', error);
    process.exit(1);
  }
}

// Run import
importAllData();

// Made with Bob
