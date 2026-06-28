/**
 * Tutor Booking System - DynamoDB Integration
 * Handles tutor availability, booked sessions, and session requests
 */

// GraphQL queries
const getTutorAvailability = `
  query GetTutorAvailability($tutorId: ID!) {
    listTutorAvailabilities(filter: {tutorId: {eq: $tutorId}}) {
      items {
        id
        tutorId
        slotId
        date
        time
        duration
        status
      }
    }
  }
`;

const getBookedSessions = `
  query GetBookedSessions($tutorId: ID!) {
    listBookedSessions(filter: {tutorId: {eq: $tutorId}}) {
      items {
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
  }
`;

const getSessionRequests = `
  query GetSessionRequests($tutorId: ID!) {
    listSessionRequests(filter: {tutorId: {eq: $tutorId}}) {
      items {
        id
        requestId
        tutorId
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

/**
 * Get tutor's availability slots
 */
async function getTutorAvailabilitySlots(tutorId) {
  try {
    const response = await fetch('/amplify_outputs.json');
    const config = await response.json();
    
    const query = {
      query: `
        query ListTutorAvailabilities {
          listTutorAvailabilities(filter: {tutorId: {eq: "${tutorId}"}}) {
            items {
              id
              tutorId
              slotId
              date
              time
              duration
              status
            }
          }
        }
      `
    };

    const result = await fetch(config.data.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.data.api_key
      },
      body: JSON.stringify(query)
    });

    const data = await result.json();
    return data.data?.listTutorAvailabilities?.items || [];
  } catch (error) {
    console.error('Error fetching tutor availability:', error);
    return [];
  }
}

/**
 * Add availability slot
 */
async function addAvailabilitySlot(tutorId, slotData) {
  try {
    const response = await fetch('/amplify_outputs.json');
    const config = await response.json();
    
    const mutation = {
      query: `
        mutation CreateTutorAvailability {
          createTutorAvailability(input: {
            tutorId: "${tutorId}"
            slotId: "${slotData.slotId}"
            date: "${slotData.date}"
            time: "${slotData.time}"
            duration: "${slotData.duration || '60'}"
            status: "available"
          }) {
            id
            tutorId
            slotId
            date
            time
            duration
            status
          }
        }
      `
    };

    const result = await fetch(config.data.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.data.api_key
      },
      body: JSON.stringify(mutation)
    });

    const data = await result.json();
    return data.data?.createTutorAvailability;
  } catch (error) {
    console.error('Error adding availability:', error);
    return null;
  }
}

/**
 * Delete availability slot
 */
async function deleteAvailabilitySlot(slotId) {
  // Callers pass our custom slotId; resolve it to the record's DynamoDB id first.
  return deleteByCustomId('TutorAvailability', 'listTutorAvailabilities', 'slotId', slotId);
}

/**
 * Delete a record identified by a custom field (not the DynamoDB id).
 * Looks up the record(s) where <field> == <value>, then deletes each by id.
 */
async function deleteByCustomId(model, listQuery, field, value) {
  try {
    const response = await fetch('/amplify_outputs.json');
    const config = await response.json();
    const headers = { 'Content-Type': 'application/json', 'x-api-key': config.data.api_key };

    const lookup = await fetch(config.data.url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        query: `query { ${listQuery}(filter: { ${field}: { eq: "${value}" } }) { items { id } } }`
      })
    });
    const lookupData = await lookup.json();
    const items = lookupData.data?.[listQuery]?.items || [];
    if (items.length === 0) {
      console.warn(`No ${model} found with ${field}=${value}`);
      return false;
    }

    for (const item of items) {
      await fetch(config.data.url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          query: `mutation { delete${model}(input: { id: "${item.id}" }) { id } }`
        })
      });
    }
    return true;
  } catch (error) {
    console.error(`Error deleting ${model} by ${field}:`, error);
    return false;
  }
}

/**
 * Get booked sessions for tutor
 */
async function getTutorBookedSessions(tutorId) {
  try {
    const response = await fetch('/amplify_outputs.json');
    const config = await response.json();
    
    const query = {
      query: `
        query ListBookedSessions {
          listBookedSessions(filter: {tutorId: {eq: "${tutorId}"}}) {
            items {
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
        }
      `
    };

    const result = await fetch(config.data.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.data.api_key
      },
      body: JSON.stringify(query)
    });

    const data = await result.json();
    return data.data?.listBookedSessions?.items || [];
  } catch (error) {
    console.error('Error fetching booked sessions:', error);
    return [];
  }
}

/**
 * Book a session
 */
async function bookSession(tutorId, studentEmail, sessionData) {
  try {
    const response = await fetch('/amplify_outputs.json');
    const config = await response.json();
    
    const mutation = {
      query: `
        mutation CreateBookedSession {
          createBookedSession(input: {
            sessionId: "${sessionData.sessionId}"
            tutorId: "${tutorId}"
            studentEmail: "${studentEmail}"
            studentName: "${sessionData.studentName || ''}"
            date: "${sessionData.date}"
            time: "${sessionData.time}"
            duration: "${sessionData.duration || '60'}"
            status: "booked"
          }) {
            id
            sessionId
            tutorId
            studentEmail
            date
            time
          }
        }
      `
    };

    const result = await fetch(config.data.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.data.api_key
      },
      body: JSON.stringify(mutation)
    });

    const data = await result.json();
    return data.data?.createBookedSession;
  } catch (error) {
    console.error('Error booking session:', error);
    return null;
  }
}

/**
 * Get all tutors
 */
async function getAllTutors() {
  try {
    const response = await fetch('/amplify_outputs.json');
    const config = await response.json();
    
    const query = {
      query: `
        query ListTutors {
          listUsers(filter: {isTutor: {eq: true}}) {
            items {
              id
              email
              displayName
              isTutor
            }
          }
        }
      `
    };

    const result = await fetch(config.data.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.data.api_key
      },
      body: JSON.stringify(query)
    });

    const data = await result.json();
    const tutors = data.data?.listUsers?.items || [];

    // Attach each tutor's availability (keyed by slotId) so 1on1.html can render it.
    // tutorId is the tutor's User.id.
    await Promise.all(tutors.map(async (tutor) => {
      const slots = await getTutorAvailabilitySlots(tutor.id);
      tutor.availability = {};
      slots.forEach(slot => { tutor.availability[slot.slotId] = slot; });
    }));

    return tutors;
  } catch (error) {
    console.error('Error fetching tutors:', error);
    return [];
  }
}
/**
 * Create a session request
 */
async function createSessionRequest(tutorId, studentEmail, requestData) {
  try {
    const response = await fetch('/amplify_outputs.json');
    const config = await response.json();
    
    const mutation = {
      query: `
        mutation CreateSessionRequest {
          createSessionRequest(input: {
            requestId: "${Date.now()}"
            tutorId: "${tutorId}"
            studentEmail: "${studentEmail}"
            studentName: "${requestData.studentName || ''}"
            date: "${requestData.date}"
            time: "${requestData.time}"
            duration: "${requestData.duration || '60'}"
            status: "requested"
          }) {
            id
            requestId
            tutorId
            studentEmail
            date
            time
            status
          }
        }
      `
    };

    const result = await fetch(config.data.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.data.api_key
      },
      body: JSON.stringify(mutation)
    });

    const data = await result.json();
    return data.data?.createSessionRequest;
  } catch (error) {
    console.error('Error creating session request:', error);
    return null;
  }
}

/**
 * Get session requests for a student
 */
async function getStudentSessionRequests(studentEmail) {
  try {
    const response = await fetch('/amplify_outputs.json');
    const config = await response.json();
    
    const query = {
      query: `
        query GetStudentRequests {
          listSessionRequests(filter: {studentEmail: {eq: "${studentEmail}"}}) {
            items {
              id
              requestId
              tutorId
              studentEmail
              studentName
              date
              time
              duration
              status
            }
          }
        }
      `
    };

    const result = await fetch(config.data.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.data.api_key
      },
      body: JSON.stringify(query)
    });

    const data = await result.json();
    return data.data?.listSessionRequests?.items || [];
  } catch (error) {
    console.error('Error fetching student session requests:', error);
    return [];
  }
}

/**
 * Get booked sessions for a student
 */
async function getStudentBookedSessions(studentEmail) {
  try {
    const response = await fetch('/amplify_outputs.json');
    const config = await response.json();
    
    const query = {
      query: `
        query GetStudentBookedSessions {
          listBookedSessions(filter: {studentEmail: {eq: "${studentEmail}"}}) {
            items {
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
        }
      `
    };

    const result = await fetch(config.data.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.data.api_key
      },
      body: JSON.stringify(query)
    });

    const data = await result.json();
    return data.data?.listBookedSessions?.items || [];
  } catch (error) {
    console.error('Error fetching student booked sessions:', error);
    return [];
  }
}


// Export functions
window.getTutorAvailabilitySlots = getTutorAvailabilitySlots;

/**
 * Get session requests for a tutor
 */
async function getTutorSessionRequests(tutorId) {
  try {
    const response = await fetch('/amplify_outputs.json');
    const config = await response.json();
    
    const query = {
      query: `
        query GetTutorRequests {
          listSessionRequests(filter: {tutorId: {eq: "${tutorId}"}}) {
            items {
              id
              requestId
              tutorId
              studentEmail
              studentName
              date
              time
              duration
              status
            }
          }
        }
      `
    };

    const result = await fetch(config.data.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.data.api_key
      },
      body: JSON.stringify(query)
    });

    const data = await result.json();
    return data.data?.listSessionRequests?.items || [];
  } catch (error) {
    console.error('Error fetching tutor session requests:', error);
    return [];
  }
}

/**
 * Delete a booked session
 */
async function deleteBookedSession(sessionId) {
  // Callers pass our custom sessionId; resolve it to the record's DynamoDB id first.
  return deleteByCustomId('BookedSession', 'listBookedSessions', 'sessionId', sessionId);
}

/**
 * Delete a session request
 */
async function deleteSessionRequest(requestId) {
  // Callers pass our custom requestId; resolve it to the record's DynamoDB id first.
  return deleteByCustomId('SessionRequest', 'listSessionRequests', 'requestId', requestId);
}

/**
 * Accept a session request (convert to booked session)
 */
async function acceptSessionRequest(requestId, tutorId, sessionData) {
  try {
    // Create booked session
    const bookedSession = await bookSession(tutorId, sessionData.studentEmail, {
      sessionId: Date.now().toString(),
      studentName: sessionData.studentName,
      date: sessionData.date,
      time: sessionData.time,
      duration: sessionData.duration
    });

    if (bookedSession) {
      // Delete the request
      await deleteSessionRequest(requestId);
      return bookedSession;
    }
    return null;
  } catch (error) {
    console.error('Error accepting session request:', error);
    return null;
  }
}

/**
 * Send a 1:1 session email via the SES Lambda. Best-effort: never throws into the flow.
 * type = 'booked' | 'cancelledBooked' | 'cancelledRequest' | 'requested' (default 'booked').
 */
async function sendBookingEmail({ type = 'booked', tutorEmail, tutorName, studentEmail, studentName, date, time, duration }) {
  try {
    const response = await fetch('/amplify_outputs.json');
    const config = await response.json();
    const mutation = `
      mutation SendBookingEmail($type: String, $tutorEmail: String!, $tutorName: String, $studentEmail: String!, $studentName: String, $date: String, $time: String, $duration: String) {
        sendBookingEmail(type: $type, tutorEmail: $tutorEmail, tutorName: $tutorName, studentEmail: $studentEmail, studentName: $studentName, date: $date, time: $time, duration: $duration)
      }
    `;
    await fetch(config.data.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': config.data.api_key },
      body: JSON.stringify({
        query: mutation,
        variables: { type, tutorEmail, tutorName, studentEmail, studentName, date, time, duration }
      })
    });
    return true;
  } catch (error) {
    console.error('sendBookingEmail failed:', error);
    return false;
  }
}

window.addAvailabilitySlot = addAvailabilitySlot;
window.deleteAvailabilitySlot = deleteAvailabilitySlot;
window.getTutorBookedSessions = getTutorBookedSessions;
window.bookSession = bookSession;
window.getAllTutors = getAllTutors;
window.sendBookingEmail = sendBookingEmail;

console.log('✅ Tutor booking system initialized (DynamoDB)');

// Made with Bob
