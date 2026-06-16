import { generateClient } from 'aws-amplify/data';

/**
 * Amplify Data Module
 * Replaces Firebase Realtime Database with AWS Amplify Data (DynamoDB)
 */

const client = generateClient();

// ============================================
// USER OPERATIONS
// ============================================

export async function getUser(userId) {
  try {
    const { data } = await client.models.User.get({ id: userId });
    return data;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
}

export async function getUserByEmail(email) {
  try {
    const { data } = await client.models.User.list({
      filter: {
        email: { eq: email }
      }
    });
    return data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error('Error getting user by email:', error);
    return null;
  }
}

export async function createUser(userData) {
  try {
    const { data } = await client.models.User.create({
      email: userData.email,
      displayName: userData.displayName,
      cohortId: userData.cohortId || null,
      isTeacher: userData.isTeacher || false,
      isTutor: userData.isTutor || false,
      progress: userData.progress || {},
      profile: userData.profile || {}
    });
    return { success: true, data };
  } catch (error) {
    console.error('Error creating user:', error);
    return { success: false, error: error.message };
  }
}

export async function updateUser(userId, updates) {
  try {
    const { data } = await client.models.User.update({
      id: userId,
      ...updates
    });
    return { success: true, data };
  } catch (error) {
    console.error('Error updating user:', error);
    return { success: false, error: error.message };
  }
}

export async function updateUserProgress(userId, sessionNumber, progressData) {
  try {
    const user = await getUser(userId);
    
    if (!user) {
      return { success: false, error: 'User not found' };
    }
    
    const currentProgress = user.progress || {};
    currentProgress[`session${sessionNumber}`] = progressData;
    
    const result = await updateUser(userId, { progress: currentProgress });
    return result;
  } catch (error) {
    console.error('Error updating progress:', error);
    return { success: false, error: error.message };
  }
}

export async function getUsersByCohort(cohortId) {
  try {
    const { data } = await client.models.User.list({
      filter: {
        cohortId: { eq: cohortId }
      }
    });
    return data;
  } catch (error) {
    console.error('Error getting users by cohort:', error);
    return [];
  }
}

// ============================================
// COHORT OPERATIONS
// ============================================

export async function getCohort(cohortId) {
  try {
    const { data } = await client.models.Cohort.get({ id: cohortId });
    return data;
  } catch (error) {
    console.error('Error getting cohort:', error);
    return null;
  }
}

export async function getCohortByCode(cohortCode) {
  try {
    const { data } = await client.models.Cohort.list({
      filter: {
        cohortCode: { eq: cohortCode }
      }
    });
    return data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error('Error getting cohort by code:', error);
    return null;
  }
}

export async function createCohort(cohortData) {
  try {
    const { data } = await client.models.Cohort.create({
      cohortCode: cohortData.cohortCode,
      name: cohortData.name,
      teacherId: cohortData.teacherId,
      teacherName: cohortData.teacherName,
      sessionReleaseDates: cohortData.sessionReleaseDates || {}
    });
    return { success: true, data };
  } catch (error) {
    console.error('Error creating cohort:', error);
    return { success: false, error: error.message };
  }
}

export async function updateCohort(cohortId, updates) {
  try {
    const { data } = await client.models.Cohort.update({
      id: cohortId,
      ...updates
    });
    return { success: true, data };
  } catch (error) {
    console.error('Error updating cohort:', error);
    return { success: false, error: error.message };
  }
}

export async function getAllCohorts() {
  try {
    const { data } = await client.models.Cohort.list();
    return data;
  } catch (error) {
    console.error('Error getting all cohorts:', error);
    return [];
  }
}

// ============================================
// TUTOR AVAILABILITY OPERATIONS
// ============================================

export async function getTutorAvailability(tutorId) {
  try {
    const { data } = await client.models.TutorAvailability.list({
      filter: {
        tutorId: { eq: tutorId }
      }
    });
    return data;
  } catch (error) {
    console.error('Error getting tutor availability:', error);
    return [];
  }
}

export async function createAvailabilitySlot(slotData) {
  try {
    const { data } = await client.models.TutorAvailability.create({
      tutorId: slotData.tutorId,
      slotId: slotData.slotId,
      date: slotData.date,
      time: slotData.time,
      duration: slotData.duration || '30min',
      status: slotData.status || 'available'
    });
    return { success: true, data };
  } catch (error) {
    console.error('Error creating availability slot:', error);
    return { success: false, error: error.message };
  }
}

export async function updateAvailabilitySlot(slotId, updates) {
  try {
    const { data } = await client.models.TutorAvailability.update({
      id: slotId,
      ...updates
    });
    return { success: true, data };
  } catch (error) {
    console.error('Error updating availability slot:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteAvailabilitySlot(slotId) {
  try {
    await client.models.TutorAvailability.delete({ id: slotId });
    return { success: true };
  } catch (error) {
    console.error('Error deleting availability slot:', error);
    return { success: false, error: error.message };
  }
}

// ============================================
// BOOKED SESSION OPERATIONS
// ============================================

export async function getBookedSessions(tutorId) {
  try {
    const { data } = await client.models.BookedSession.list({
      filter: {
        tutorId: { eq: tutorId }
      }
    });
    return data;
  } catch (error) {
    console.error('Error getting booked sessions:', error);
    return [];
  }
}

export async function getStudentBookedSessions(studentEmail) {
  try {
    const { data } = await client.models.BookedSession.list({
      filter: {
        studentEmail: { eq: studentEmail }
      }
    });
    return data;
  } catch (error) {
    console.error('Error getting student booked sessions:', error);
    return [];
  }
}

export async function createBookedSession(sessionData) {
  try {
    const { data } = await client.models.BookedSession.create({
      sessionId: sessionData.sessionId,
      tutorId: sessionData.tutorId,
      studentEmail: sessionData.studentEmail,
      studentName: sessionData.studentName,
      date: sessionData.date,
      time: sessionData.time,
      duration: sessionData.duration || '30min',
      status: sessionData.status || 'confirmed'
    });
    return { success: true, data };
  } catch (error) {
    console.error('Error creating booked session:', error);
    return { success: false, error: error.message };
  }
}

export async function updateBookedSession(sessionId, updates) {
  try {
    const { data } = await client.models.BookedSession.update({
      id: sessionId,
      ...updates
    });
    return { success: true, data };
  } catch (error) {
    console.error('Error updating booked session:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteBookedSession(sessionId) {
  try {
    await client.models.BookedSession.delete({ id: sessionId });
    return { success: true };
  } catch (error) {
    console.error('Error deleting booked session:', error);
    return { success: false, error: error.message };
  }
}

// ============================================
// SESSION REQUEST OPERATIONS
// ============================================

export async function getSessionRequests(tutorId) {
  try {
    const { data } = await client.models.SessionRequest.list({
      filter: {
        tutorId: { eq: tutorId }
      }
    });
    return data;
  } catch (error) {
    console.error('Error getting session requests:', error);
    return [];
  }
}

export async function createSessionRequest(requestData) {
  try {
    const { data } = await client.models.SessionRequest.create({
      requestId: requestData.requestId,
      tutorId: requestData.tutorId,
      studentEmail: requestData.studentEmail,
      studentName: requestData.studentName,
      date: requestData.date,
      time: requestData.time,
      duration: requestData.duration || '30min',
      status: requestData.status || 'pending'
    });
    return { success: true, data };
  } catch (error) {
    console.error('Error creating session request:', error);
    return { success: false, error: error.message };
  }
}

export async function updateSessionRequest(requestId, updates) {
  try {
    const { data } = await client.models.SessionRequest.update({
      id: requestId,
      ...updates
    });
    return { success: true, data };
  } catch (error) {
    console.error('Error updating session request:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteSessionRequest(requestId) {
  try {
    await client.models.SessionRequest.delete({ id: requestId });
    return { success: true };
  } catch (error) {
    console.error('Error deleting session request:', error);
    return { success: false, error: error.message };
  }
}

// Export for global access (backward compatibility)
if (typeof window !== 'undefined') {
  window.amplifyData = {
    // User operations
    getUser,
    getUserByEmail,
    createUser,
    updateUser,
    updateUserProgress,
    getUsersByCohort,
    // Cohort operations
    getCohort,
    getCohortByCode,
    createCohort,
    updateCohort,
    getAllCohorts,
    // Tutor availability
    getTutorAvailability,
    createAvailabilitySlot,
    updateAvailabilitySlot,
    deleteAvailabilitySlot,
    // Booked sessions
    getBookedSessions,
    getStudentBookedSessions,
    createBookedSession,
    updateBookedSession,
    deleteBookedSession,
    // Session requests
    getSessionRequests,
    createSessionRequest,
    updateSessionRequest,
    deleteSessionRequest
  };
}

// Made with Bob
