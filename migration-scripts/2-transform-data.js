/**
 * Step 2: Transform Data for AWS
 * 
 * This script transforms Firebase data structure to AWS DynamoDB format.
 * 
 * Usage: node 2-transform-data.js
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const exportDir = path.join(__dirname, 'export');

function generateId() {
  return crypto.randomBytes(16).toString('hex');
}

function transformUsers(firebaseUsers) {
  console.log('🔄 Transforming users...');
  const dynamoUsers = [];
  
  for (const [userId, userData] of Object.entries(firebaseUsers)) {
    const transformedUser = {
      userId: userId,
      email: userData.email || '',
      displayName: userData.displayName || userData.email || 'Unknown',
      cohortId: userData.cohort || '',
      isTeacher: userData.teacher || false,
      isTutor: userData.tutor || false,
      profile: userData.profile || {},
      progress: userData.progress || {},
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    dynamoUsers.push(transformedUser);
  }
  
  console.log(`✅ Transformed ${dynamoUsers.length} users`);
  return dynamoUsers;
}

function transformCohorts(firebaseCohorts) {
  console.log('🔄 Transforming cohorts...');
  const dynamoCohorts = [];
  
  for (const [cohortId, cohortData] of Object.entries(firebaseCohorts)) {
    const transformedCohort = {
      cohortId: cohortId,
      cohortCode: cohortData.code || '',
      name: cohortData.name || '',
      teacherId: cohortData.teacherId || '',
      teacherName: cohortData.teacherName || '',
      sessionReleaseDates: cohortData.sessionReleaseDates || {},
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    dynamoCohorts.push(transformedCohort);
  }
  
  console.log(`✅ Transformed ${dynamoCohorts.length} cohorts`);
  return dynamoCohorts;
}

function transformTutorAvailability(availabilityData) {
  console.log('🔄 Transforming tutor availability...');
  const dynamoAvailability = [];
  
  for (const [tutorId, slots] of Object.entries(availabilityData)) {
    for (const [slotId, slotData] of Object.entries(slots)) {
      const transformedSlot = {
        tutorId: tutorId,
        slotId: slotId,
        date: slotData.date || '',
        time: slotData.time || '',
        duration: slotData.duration || '60',
        status: slotData.status || 'available',
        createdAt: Date.now()
      };
      
      dynamoAvailability.push(transformedSlot);
    }
  }
  
  console.log(`✅ Transformed ${dynamoAvailability.length} availability slots`);
  return dynamoAvailability;
}

function transformBookedSessions(bookedSessionsData) {
  console.log('🔄 Transforming booked sessions...');
  const dynamoSessions = [];
  
  for (const [tutorId, sessions] of Object.entries(bookedSessionsData)) {
    for (const [sessionId, sessionData] of Object.entries(sessions)) {
      const transformedSession = {
        sessionId: sessionId,
        tutorId: tutorId,
        studentEmail: sessionData.studentEmail || '',
        studentName: sessionData.studentName || '',
        date: sessionData.date || '',
        time: sessionData.time || '',
        duration: sessionData.duration || '60',
        status: sessionData.status || 'booked',
        createdAt: Date.now()
      };
      
      dynamoSessions.push(transformedSession);
    }
  }
  
  console.log(`✅ Transformed ${dynamoSessions.length} booked sessions`);
  return dynamoSessions;
}

function transformSessionRequests(requestsData, requestedSessionsData) {
  console.log('🔄 Transforming session requests...');
  const dynamoRequests = [];
  
  // Transform global session requests
  for (const [requestId, requestData] of Object.entries(requestsData)) {
    const transformedRequest = {
      requestId: requestId,
      tutorId: requestData.tutorId || '',
      studentEmail: requestData.studentEmail || '',
      studentName: requestData.studentName || '',
      date: requestData.date || '',
      time: requestData.time || '',
      duration: requestData.duration || '60',
      status: 'pending',
      createdAt: Date.now()
    };
    
    dynamoRequests.push(transformedRequest);
  }
  
  // Also transform requested sessions nested in users
  for (const [tutorId, sessions] of Object.entries(requestedSessionsData)) {
    for (const [sessionId, sessionData] of Object.entries(sessions)) {
      // Check if this request already exists in global requests
      const existingRequest = dynamoRequests.find(
        r => r.requestId === sessionData.sessionRequestId
      );
      
      if (!existingRequest) {
        const transformedRequest = {
          requestId: sessionData.sessionRequestId || generateId(),
          tutorId: tutorId,
          studentEmail: sessionData.studentEmail || '',
          studentName: sessionData.studentName || '',
          date: sessionData.date || '',
          time: sessionData.time || '',
          duration: sessionData.duration || '60',
          status: 'pending',
          createdAt: Date.now()
        };
        
        dynamoRequests.push(transformedRequest);
      }
    }
  }
  
  console.log(`✅ Transformed ${dynamoRequests.length} session requests`);
  return dynamoRequests;
}

async function transformData() {
  console.log('🚀 Starting data transformation...\n');

  try {
    // Read exported data
    const users = JSON.parse(fs.readFileSync(path.join(exportDir, 'users.json'), 'utf8'));
    const cohorts = JSON.parse(fs.readFileSync(path.join(exportDir, 'cohorts.json'), 'utf8'));
    const sessionRequests = JSON.parse(fs.readFileSync(path.join(exportDir, 'sessionRequests.json'), 'utf8'));
    const tutorAvailability = JSON.parse(fs.readFileSync(path.join(exportDir, 'tutorAvailability.json'), 'utf8'));
    const bookedSessions = JSON.parse(fs.readFileSync(path.join(exportDir, 'bookedSessions.json'), 'utf8'));
    const requestedSessions = JSON.parse(fs.readFileSync(path.join(exportDir, 'requestedSessions.json'), 'utf8'));

    // Transform data
    const transformedUsers = transformUsers(users);
    const transformedCohorts = transformCohorts(cohorts);
    const transformedAvailability = transformTutorAvailability(tutorAvailability);
    const transformedBookedSessions = transformBookedSessions(bookedSessions);
    const transformedRequests = transformSessionRequests(sessionRequests, requestedSessions);

    // Save transformed data
    console.log('\n💾 Saving transformed data...');
    
    fs.writeFileSync(
      path.join(exportDir, 'dynamodb-users.json'),
      JSON.stringify(transformedUsers, null, 2)
    );
    console.log('✅ Saved dynamodb-users.json');

    fs.writeFileSync(
      path.join(exportDir, 'dynamodb-cohorts.json'),
      JSON.stringify(transformedCohorts, null, 2)
    );
    console.log('✅ Saved dynamodb-cohorts.json');

    fs.writeFileSync(
      path.join(exportDir, 'dynamodb-availability.json'),
      JSON.stringify(transformedAvailability, null, 2)
    );
    console.log('✅ Saved dynamodb-availability.json');

    fs.writeFileSync(
      path.join(exportDir, 'dynamodb-sessions.json'),
      JSON.stringify(transformedBookedSessions, null, 2)
    );
    console.log('✅ Saved dynamodb-sessions.json');

    fs.writeFileSync(
      path.join(exportDir, 'dynamodb-requests.json'),
      JSON.stringify(transformedRequests, null, 2)
    );
    console.log('✅ Saved dynamodb-requests.json');

    // Create transformation summary
    const summary = {
      transformDate: new Date().toISOString(),
      counts: {
        users: transformedUsers.length,
        cohorts: transformedCohorts.length,
        availability: transformedAvailability.length,
        bookedSessions: transformedBookedSessions.length,
        sessionRequests: transformedRequests.length
      }
    };

    fs.writeFileSync(
      path.join(exportDir, 'transform-summary.json'),
      JSON.stringify(summary, null, 2)
    );

    console.log('\n✨ Transformation complete!');
    console.log('\n📊 Summary:');
    console.log(JSON.stringify(summary.counts, null, 2));

  } catch (error) {
    console.error('❌ Error transforming data:', error);
    process.exit(1);
  }
}

// Run transformation
transformData();

// Made with Bob
