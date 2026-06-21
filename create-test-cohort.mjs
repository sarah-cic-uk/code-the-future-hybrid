#!/usr/bin/env node

/**
 * Create Test Cohort in DynamoDB
 * 
 * This script creates a test cohort that students can use to register.
 * Run this after your Amplify sandbox is deployed.
 * 
 * Usage: node create-test-cohort.js
 */

import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import { readFileSync } from 'fs';

// Load Amplify configuration
const config = JSON.parse(readFileSync('./public/amplify_outputs.json', 'utf8'));
Amplify.configure(config);

const client = generateClient();

async function createTestCohort() {
  console.log('🚀 Creating test cohort in DynamoDB...\n');

  const cohortData = {
    cohortCode: 'TEST2024',
    name: 'Test Cohort 2024',
    teacherId: null,
    teacherName: null,
    sessionReleaseDates: {
      session1: 0,
      session2: 0,
      session3: 0,
      session4: 0,
      session5: 0,
      session6: 0,
      session7: 0
    }
  };

  try {
    // Check if cohort already exists
    const { data: existing } = await client.models.Cohort.list({
      filter: {
        cohortCode: { eq: 'TEST2024' }
      }
    });

    if (existing && existing.length > 0) {
      console.log('⚠️  Cohort TEST2024 already exists!');
      console.log('📋 Existing cohort details:');
      console.log(JSON.stringify(existing[0], null, 2));
      return;
    }

    // Create the cohort
    const { data: newCohort, errors } = await client.models.Cohort.create(cohortData);

    if (errors) {
      console.error('❌ Error creating cohort:', errors);
      return;
    }

    console.log('✅ Test cohort created successfully!\n');
    console.log('📋 Cohort Details:');
    console.log('─────────────────────────────────────');
    console.log(`Cohort Code: ${newCohort.cohortCode}`);
    console.log(`Name: ${newCohort.name}`);
    console.log(`ID: ${newCohort.id}`);
    console.log('\n📅 Session Release Dates:');
    console.log(JSON.stringify(newCohort.sessionReleaseDates, null, 2));
    console.log('\n✨ Students can now register using cohort code: TEST2024');
    console.log('🔑 Tutor code: cTfTut0rCod3!1 (creates tutor accounts)\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\n💡 Make sure your Amplify sandbox is running:');
    console.error('   cd amplify-backend && npx ampx sandbox\n');
  }
}

// Run the script
createTestCohort();

// Made with Bob
