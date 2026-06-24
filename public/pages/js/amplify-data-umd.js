/**
 * Amplify Data Module (UMD Version)
 * Handles DynamoDB operations via AppSync GraphQL
 * Uses global window.AmplifyData object
 */

// Wait for Amplify to be initialized
function waitForAmplify() {
  return new Promise((resolve) => {
    if (window.AmplifyData) {
      resolve();
    } else {
      const checkInterval = setInterval(() => {
        if (window.AmplifyData) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
    }
  });
}

// Get GraphQL client
async function getClient() {
  await waitForAmplify();
  return window.AmplifyData.generateClient();
}

// User operations
async function getUserByEmail(email) {
  try {
    const client = await getClient();
    const { data } = await client.models.User.list({
      filter: { email: { eq: email } }
    });
    return data && data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
}

async function createUser(email, displayName, cohortId = null) {
  try {
    const client = await getClient();
    const { data } = await client.models.User.create({
      email,
      displayName,
      cohortId,
      isTeacher: false,
      isTutor: false,
      progress: {},
      profile: {}
    });
    return data;
  } catch (error) {
    console.error('Error creating user:', error);
    return null;
  }
}

async function updateUser(userId, updates) {
  try {
    const client = await getClient();
    const { data } = await client.models.User.update({
      id: userId,
      ...updates
    });
    return data;
  } catch (error) {
    console.error('Error updating user:', error);
    return null;
  }
}

async function getUsersByCohort(cohortId) {
  try {
    const client = await getClient();
    const { data } = await client.models.User.list({
      filter: { cohortId: { eq: cohortId } }
    });
    return data || [];
  } catch (error) {
    console.error('Error getting users by cohort:', error);
    return [];
  }
}

// Cohort operations
async function getCohortByCode(cohortCode) {
  try {
    const client = await getClient();
    const { data } = await client.models.Cohort.list({
      filter: { cohortCode: { eq: cohortCode } }
    });
    return data && data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error('Error getting cohort:', error);
    return null;
  }
}

async function getCohortById(cohortId) {
  try {
    const client = await getClient();
    const { data } = await client.models.Cohort.get({ id: cohortId });
    return data;
  } catch (error) {
    console.error('Error getting cohort by ID:', error);
    return null;
  }
}

async function createCohort(cohortCode, name, teacherId, teacherName) {
  try {
    const client = await getClient();
    const { data } = await client.models.Cohort.create({
      cohortCode,
      name,
      teacherId,
      teacherName,
      sessionReleaseDates: {}
    });
    return data;
  } catch (error) {
    console.error('Error creating cohort:', error);
    return null;
  }
}

async function updateCohort(cohortId, updates) {
  try {
    const client = await getClient();
    const { data } = await client.models.Cohort.update({
      id: cohortId,
      ...updates
    });
    return data;
  } catch (error) {
    console.error('Error updating cohort:', error);
    return null;
  }
}

async function getAllCohorts() {
  try {
    const client = await getClient();
    const { data } = await client.models.Cohort.list();
    return data || [];
  } catch (error) {
    console.error('Error getting all cohorts:', error);
    return [];
  }
}

// Tutor Availability operations
async function getTutorAvailability(tutorId) {
  try {
    const client = await getClient();
    const { data } = await client.models.TutorAvailability.list({
      filter: { tutorId: { eq: tutorId } }
    });
    return data || [];
  } catch (error) {
    console.error('Error getting tutor availability:', error);
    return [];
  }
}

async function createAvailabilitySlot(tutorId, slotId, date, time, duration = '60') {
  try {
    const client = await getClient();
    const { data } = await client.models.TutorAvailability.create({
      tutorId,
      slotId,
      date,
      time,
      duration,
      status: 'available'
    });
    return data;
  } catch (error) {
    console.error('Error creating availability slot:', error);
    return null;
  }
}

async function deleteAvailabilitySlot(slotId) {
  try {
    const client = await getClient();
    await client.models.TutorAvailability.delete({ id: slotId });
    return true;
  } catch (error) {
    console.error('Error deleting availability slot:', error);
    return false;
  }
}

// Booked Session operations
async function getBookedSessions(tutorId) {
  try {
    const client = await getClient();
    const { data } = await client.models.BookedSession.list({
      filter: { tutorId: { eq: tutorId } }
    });
    return data || [];
  } catch (error) {
    console.error('Error getting booked sessions:', error);
    return [];
  }
}

async function getStudentBookedSessions(studentEmail) {
  try {
    const client = await getClient();
    const { data } = await client.models.BookedSession.list({
      filter: { studentEmail: { eq: studentEmail } }
    });
    return data || [];
  } catch (error) {
    console.error('Error getting student booked sessions:', error);
    return [];
  }
}

async function createBookedSession(sessionId, tutorId, studentEmail, studentName, date, time, duration = '60') {
  try {
    const client = await getClient();
    const { data } = await client.models.BookedSession.create({
      sessionId,
      tutorId,
      studentEmail,
      studentName,
      date,
      time,
      duration,
      status: 'confirmed'
    });
    return data;
  } catch (error) {
    console.error('Error creating booked session:', error);
    return null;
  }
}

async function deleteBookedSession(sessionId) {
  try {
    const client = await getClient();
    await client.models.BookedSession.delete({ id: sessionId });
    return true;
  } catch (error) {
    console.error('Error deleting booked session:', error);
    return false;
  }
}

// Session Request operations
async function getSessionRequests(tutorId) {
  try {
    const client = await getClient();
    const { data } = await client.models.SessionRequest.list({
      filter: { tutorId: { eq: tutorId } }
    });
    return data || [];
  } catch (error) {
    console.error('Error getting session requests:', error);
    return [];
  }
}

async function createSessionRequest(requestId, tutorId, studentEmail, studentName, date, time, duration = '60') {
  try {
    const client = await getClient();
    const { data } = await client.models.SessionRequest.create({
      requestId,
      tutorId,
      studentEmail,
      studentName,
      date,
      time,
      duration,
      status: 'pending'
    });
    return data;
  } catch (error) {
    console.error('Error creating session request:', error);
    return null;
  }
}

async function deleteSessionRequest(requestId) {
  try {
    const client = await getClient();
    await client.models.SessionRequest.delete({ id: requestId });
    return true;
  } catch (error) {
    console.error('Error deleting session request:', error);
    return false;
  }
}

// Make functions available globally
window.amplifyData = {
  // User operations
  getUserByEmail,
  createUser,
  updateUser,
  getUsersByCohort,
  
  // Cohort operations
  getCohortByCode,
  getCohortById,
  createCohort,
  updateCohort,
  getAllCohorts,
  
  // Tutor availability
  getTutorAvailability,
  createAvailabilitySlot,
  deleteAvailabilitySlot,
  
  // Booked sessions
  getBookedSessions,
  getStudentBookedSessions,
  createBookedSession,
  deleteBookedSession,
  
  // Session requests
  getSessionRequests,
  createSessionRequest,
  deleteSessionRequest
};

console.log('✅ Amplify Data helpers loaded (UMD)');

// Made with Bob
