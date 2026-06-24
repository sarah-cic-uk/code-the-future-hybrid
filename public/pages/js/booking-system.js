/**
 * Tutor Booking System for AWS DynamoDB
 */

async function getAPIConfig() {
  const response = await fetch('/amplify_outputs.json');
  const config = await response.json();
  return {
    endpoint: config.data.url,
    apiKey: config.data.api_key
  };
}

async function executeGraphQL(query, variables = {}) {
  const config = await getAPIConfig();
  const response = await fetch(config.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.apiKey
    },
    body: JSON.stringify({ query, variables })
  });
  
  const result = await response.json();
  if (result.errors) throw new Error(result.errors[0].message);
  return result.data;
}

/**
 * TUTOR FUNCTIONS
 */

// Create availability slot
async function createAvailability(tutorId, date, time, duration) {
  const mutation = `
    mutation CreateTutorAvailability($input: CreateTutorAvailabilityInput!) {
      createTutorAvailability(input: $input) {
        id
        tutorId
        slotId
        date
        time
        duration
        status
      }
    }
  `;
  
  const slotId = `${date}_${time}`.replace(/[^a-zA-Z0-9]/g, '_');
  
  const data = await executeGraphQL(mutation, {
    input: {
      tutorId,
      slotId,
      date,
      time,
      duration: duration || '60',
      status: 'available'
    }
  });
  
  return data.createTutorAvailability;
}

// Get tutor's availability
async function getTutorAvailability(tutorId) {
  const query = `
    query ListTutorAvailability($tutorId: String!) {
      listTutorAvailabilities(filter: { tutorId: { eq: $tutorId } }) {
        items {
          id
          slotId
          date
          time
          duration
          status
        }
      }
    }
  `;
  
  const data = await executeGraphQL(query, { tutorId });
  return data.listTutorAvailabilities.items;
}

// Get tutor's bookings
async function getTutorBookings(tutorId) {
  const query = `
    query ListBookedSessions($tutorId: String!) {
      listBookedSessions(filter: { tutorId: { eq: $tutorId } }) {
        items {
          id
          sessionId
          studentEmail
          studentName
          date
          time
          duration
          status
        }
      }
    }
  `;
  
  const data = await executeGraphQL(query, { tutorId });
  return data.listBookedSessions.items;
}

/**
 * STUDENT FUNCTIONS
 */

// Get all available tutors
async function getAvailableTutors() {
  const query = `
    query ListTutorAvailability {
      listTutorAvailabilities(filter: { status: { eq: "available" } }) {
        items {
          id
          tutorId
          slotId
          date
          time
          duration
        }
      }
    }
  `;
  
  const data = await executeGraphQL(query);
  return data.listTutorAvailabilities.items;
}

// Book a session
async function bookSession(tutorId, slotId, studentEmail, studentName, date, time, duration) {
  const mutation = `
    mutation CreateBookedSession($input: CreateBookedSessionInput!) {
      createBookedSession(input: $input) {
        id
        sessionId
        tutorId
        studentEmail
        studentName
        date
        time
        duration
        status
      }
    }
  `;
  
  const sessionId = `${tutorId}_${slotId}`;
  
  const data = await executeGraphQL(mutation, {
    input: {
      sessionId,
      tutorId,
      studentEmail,
      studentName,
      date,
      time,
      duration,
      status: 'confirmed'
    }
  });
  
  // Update availability status
  await updateAvailabilityStatus(slotId, 'booked');
  
  return data.createBookedSession;
}

// Get student's bookings
async function getStudentBookings(studentEmail) {
  const query = `
    query ListBookedSessions($studentEmail: String!) {
      listBookedSessions(filter: { studentEmail: { eq: $studentEmail } }) {
        items {
          id
          sessionId
          tutorId
          date
          time
          duration
          status
        }
      }
    }
  `;
  
  const data = await executeGraphQL(query, { studentEmail });
  return data.listBookedSessions.items;
}

// Helper: Update availability status
async function updateAvailabilityStatus(slotId, status) {
  const mutation = `
    mutation UpdateTutorAvailability($id: ID!, $status: String!) {
      updateTutorAvailability(input: { id: $id, status: $status }) {
        id
        status
      }
    }
  `;
  
  await executeGraphQL(mutation, { id: slotId, status });
}

// Export functions
window.createAvailability = createAvailability;
window.getTutorAvailability = getTutorAvailability;
window.getTutorBookings = getTutorBookings;
window.getAvailableTutors = getAvailableTutors;
window.bookSession = bookSession;
window.getStudentBookings = getStudentBookings;