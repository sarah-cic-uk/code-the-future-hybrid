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
async function getTutorAvailabilitySlots(tutorEmail) {
  try {
    const response = await fetch('/amplify_outputs.json');
    const config = await response.json();
    
    const query = {
      query: `
        query ListTutorAvailabilities {
          listTutorAvailabilities(filter: {tutorId: {eq: "${tutorEmail}"}}) {
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
async function addAvailabilitySlot(tutorEmail, slotData) {
  try {
    const response = await fetch('/amplify_outputs.json');
    const config = await response.json();
    
    const mutation = {
      query: `
        mutation CreateTutorAvailability {
          createTutorAvailability(input: {
            tutorId: "${tutorEmail}"
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
  try {
    const response = await fetch('/amplify_outputs.json');
    const config = await response.json();
    
    const mutation = {
      query: `
        mutation DeleteTutorAvailability {
          deleteTutorAvailability(input: {id: "${slotId}"}) {
            id
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

    return result.ok;
  } catch (error) {
    console.error('Error deleting availability:', error);
    return false;
  }
}

/**
 * Get booked sessions for tutor
 */
async function getTutorBookedSessions(tutorEmail) {
  try {
    const response = await fetch('/amplify_outputs.json');
    const config = await response.json();
    
    const query = {
      query: `
        query ListBookedSessions {
          listBookedSessions(filter: {tutorId: {eq: "${tutorEmail}"}}) {
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
async function bookSession(tutorEmail, studentEmail, sessionData) {
  try {
    const response = await fetch('/amplify_outputs.json');
    const config = await response.json();
    
    const mutation = {
      query: `
        mutation CreateBookedSession {
          createBookedSession(input: {
            sessionId: "${sessionData.sessionId}"
            tutorId: "${tutorEmail}"
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
    return data.data?.listUsers?.items || [];
  } catch (error) {
    console.error('Error fetching tutors:', error);
    return [];
  }
}
/**
 * Create a session request
 */
async function createSessionRequest(tutorEmail, studentEmail, requestData) {
  try {
    const response = await fetch('/amplify_outputs.json');
    const config = await response.json();
    
    const mutation = {
      query: `
        mutation CreateSessionRequest {
          createSessionRequest(input: {
            requestId: "${Date.now()}"
            tutorId: "${tutorEmail}"
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
async function getTutorSessionRequests(tutorEmail) {
  try {
    const response = await fetch('/amplify_outputs.json');
    const config = await response.json();
    
    const query = {
      query: `
        query GetTutorRequests {
          listSessionRequests(filter: {tutorId: {eq: "${tutorEmail}"}}) {
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
  try {
    const response = await fetch('/amplify_outputs.json');
    const config = await response.json();
    
    const mutation = {
      query: `
        mutation DeleteBookedSession {
          deleteBookedSession(input: {id: "${sessionId}"}) {
            id
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
    return data.data?.deleteBookedSession;
  } catch (error) {
    console.error('Error deleting booked session:', error);
    return null;
  }
}

/**
 * Delete a session request
 */
async function deleteSessionRequest(requestId) {
  try {
    const response = await fetch('/amplify_outputs.json');
    const config = await response.json();
    
    const mutation = {
      query: `
        mutation DeleteSessionRequest {
          deleteSessionRequest(input: {id: "${requestId}"}) {
            id
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
    return data.data?.deleteSessionRequest;
  } catch (error) {
    console.error('Error deleting session request:', error);
    return null;
  }
}

/**
 * Accept a session request (convert to booked session)
 */
async function acceptSessionRequest(requestId, tutorEmail, sessionData) {
  try {
    // Create booked session
    const bookedSession = await bookSession(tutorEmail, sessionData.studentEmail, {
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

window.addAvailabilitySlot = addAvailabilitySlot;
window.deleteAvailabilitySlot = deleteAvailabilitySlot;
window.getTutorBookedSessions = getTutorBookedSessions;
window.bookSession = bookSession;
window.getAllTutors = getAllTutors;

console.log('✅ Tutor booking system initialized (DynamoDB)');

// Made with Bob
