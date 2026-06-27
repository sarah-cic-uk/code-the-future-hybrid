/**
 * Cohort Management for AWS DynamoDB
 * Handles teacher and admin cohort operations
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
  if (result.errors) {
    console.error('GraphQL errors:', result.errors);
    throw new Error(result.errors[0].message);
  }
  return result.data;
}

/**
 * Get cohort by cohort code
 */
async function getCohortByCode(cohortCode) {
  const query = `
    query ListCohorts($cohortCode: String!) {
      listCohorts(filter: { cohortCode: { eq: $cohortCode } }) {
        items {
          id
          cohortCode
          name
          teacherId
          teacherName
          sessionReleaseDates
        }
      }
    }
  `;
  
  try {
    const data = await executeGraphQL(query, { cohortCode });
    const cohorts = data.listCohorts.items;
    return cohorts.length > 0 ? cohorts[0] : null;
  } catch (error) {
    console.error('Error getting cohort:', error);
    return null;
  }
}

/**
 * Get all students in a cohort
 */
async function getStudentsByCohort(cohortCode) {
  const query = `
    query ListUsers($cohortCode: String!) {
      listUsers(filter: { cohortId: { eq: $cohortCode } }) {
        items {
          id
          email
          displayName
          progress
          profile
          cohortId
        }
      }
    }
  `;
  
  try {
    const data = await executeGraphQL(query, { cohortCode });
    return data.listUsers.items;
  } catch (error) {
    console.error('Error getting students:', error);
    return [];
  }
}

/**
 * Get all cohorts (admin only)
 */
async function getAllCohorts() {
  const query = `
    query ListCohorts {
      listCohorts {
        items {
          id
          cohortCode
          name
          teacherId
          teacherName
          sessionReleaseDates
        }
      }
    }
  `;
  
  try {
    const data = await executeGraphQL(query);
    return data.listCohorts.items;
  } catch (error) {
    console.error('Error getting cohorts:', error);
    return [];
  }
}

/**
 * Update cohort
 */
async function updateCohort(cohortId, updates) {
  const mutation = `
    mutation UpdateCohort($id: ID!, $name: String, $sessionReleaseDates: AWSJSON) {
      updateCohort(input: { 
        id: $id, 
        name: $name,
        sessionReleaseDates: $sessionReleaseDates
      }) {
        id
        cohortCode
        name
        sessionReleaseDates
      }
    }
  `;
  
  try {
    const variables = {
      id: cohortId,
      ...updates
    };
    
    // Convert sessionReleaseDates to JSON string if it's an object
    if (updates.sessionReleaseDates && typeof updates.sessionReleaseDates === 'object') {
      variables.sessionReleaseDates = JSON.stringify(updates.sessionReleaseDates);
    }
    
    const data = await executeGraphQL(mutation, variables);
    return data.updateCohort;
  } catch (error) {
    console.error('Error updating cohort:', error);
    throw error;
  }
}

/**
 * Get student progress statistics
 */
function calculateCohortProgress(students) {
  const stats = {
    totalStudents: students.length,
    activeStudents: 0,
    completedStudents: 0,
    averageProgress: 0,
    sessionStats: {}
  };
  
  // Initialize session stats
  for (let i = 1; i <= 7; i++) {
    stats.sessionStats[`session${i}`] = {
      completed: 0,
      inProgress: 0
    };
  }
  
  let totalProgress = 0;
  
  students.forEach(student => {
    if (!student.progress) return;
    
    const progress = typeof student.progress === 'string' 
      ? JSON.parse(student.progress) 
      : student.progress;
    
    let completedSessions = 0;
    let hasProgress = false;
    
    for (let i = 1; i <= 7; i++) {
      const sessionKey = `session${i}`;
      if (progress[sessionKey]) {
        hasProgress = true;
        if (progress[sessionKey].completed) {
          completedSessions++;
          stats.sessionStats[sessionKey].completed++;
        } else if (progress[sessionKey].lastAccessed) {
          stats.sessionStats[sessionKey].inProgress++;
        }
      }
    }
    
    const percentage = (completedSessions / 7) * 100;
    totalProgress += percentage;
    
    if (hasProgress) stats.activeStudents++;
    if (percentage === 100) stats.completedStudents++;
  });
  
  stats.averageProgress = students.length > 0 
    ? Math.round(totalProgress / students.length) 
    : 0;
  
  return stats;
}

/**
 * Course curriculum — keep in sync with sidenav.js.
 * A session counts as complete when all of its REQUIRED lessons are done
 * (optional lessons are excluded), or when it was manually marked complete.
 */
const COURSE_LESSONS = {
  session1: ['session1-overview', 'introIDE', 'introGit', 'firstRepo', 'hostingGithub', 'gitVScode', 'gitTerminal', 'githubDesktop'],
  session2: ['session2-overview', 'htmlBasics', 'firstWebpage', 'chromeDevTools'],
  session3: ['session3-overview', 'html_images', 'html_tables', 'html_forms', 'html_hyperlinks'],
  session4: ['session4-overview', 'introToCSS', 'layoutsInCSS', 'advancedCSS', 'cssActivities'],
  session5: ['session5-overview', 'accessibility', 'accessibilityTools', 'accessibilityExample'],
  session6: ['session6-overview', 'projectPlanning', 'additionalHelp'],
  session7: ['session7-overview', 'goodUses', 'humanFirst', 'promptPractice', 'modelsTokensCosts', 'reviewAndRepeat']
};
const OPTIONAL_LESSONS = {
  session1: ['gitTerminal', 'githubDesktop'],
  session5: ['accessibilityExample'],
  session6: ['additionalHelp']
};

function requiredLessonsFor(sessionKey) {
  const optional = OPTIONAL_LESSONS[sessionKey] || [];
  return (COURSE_LESSONS[sessionKey] || []).filter(name => !optional.includes(name));
}

// A session is complete if manually marked, or all required lessons are done.
function isSessionComplete(sessionKey, progress) {
  const s = progress[sessionKey];
  if (!s) return false;
  if (s.completed) return true;
  const done = s.completedLessons || {};
  const required = requiredLessonsFor(sessionKey);
  return required.length > 0 && required.every(name => done[name]);
}

/**
 * Get individual student progress details (rolls up lesson completion)
 */
function getStudentProgressDetails(student) {
  let progress = {};
  if (student.progress) {
    try {
      progress = typeof student.progress === 'string' ? JSON.parse(student.progress) : student.progress;
    } catch (e) {
      console.error('Error parsing progress:', e);
    }
  }

  let completedCount = 0;
  let lastAccessedDate = 0;
  const sessions = {};

  for (let i = 1; i <= 7; i++) {
    const sessionKey = `session${i}`;
    const raw = progress[sessionKey] || {};
    const complete = isSessionComplete(sessionKey, progress);
    sessions[sessionKey] = {
      completed: complete,
      lastAccessed: raw.lastAccessed || null,
      completedDate: raw.completedDate || null,
      completedLessons: raw.completedLessons || {}
    };
    if (complete) completedCount++;
    if (raw.lastAccessed && raw.lastAccessed > lastAccessedDate) lastAccessedDate = raw.lastAccessed;
  }

  let status = 'Not Started';
  if (completedCount === 7) status = 'Completed';
  else if (completedCount > 0 || lastAccessedDate > 0) status = 'In Progress';

  return {
    completedSessions: completedCount,
    completedCount,
    totalSessions: 7,
    percentage: Math.round((completedCount / 7) * 100),
    status,
    lastAccessedDate,
    sessions
  };
}

/**
 * Get user by email
 */
async function getUserByEmail(email) {
  const query = `
    query ListUsers($email: String!) {
      listUsers(filter: { email: { eq: $email } }) {
        items {
          id
          email
          displayName
          cohortId
          isTeacher
          isTutor
          schoolPrefix
          progress
          profile
        }
      }
    }
  `;
  
  try {
    const data = await executeGraphQL(query, { email });
    const users = data.listUsers.items;
    return users.length > 0 ? users[0] : null;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
}

/**
 * Get user by DynamoDB ID
 */
async function getUserById(id) {
  const query = `
    query GetUser($id: ID!) {
      getUser(id: $id) {
        id
        email
        displayName
        cohortId
        isTeacher
        isTutor
        schoolPrefix
        progress
        profile
      }
    }
  `;

  try {
    const data = await executeGraphQL(query, { id });
    return data.getUser || null;
  } catch (error) {
    console.error('Error getting user by id:', error);
    return null;
  }
}

/**
 * Get profile picture URL from S3 (presigned, authenticated read).
 * Requires window.profilePictures (s3-profile-pictures.js) to be loaded.
 * @param {string} userId - DynamoDB user ID
 * @returns {Promise<string>} - Profile picture URL or default avatar
 */
async function getProfilePictureUrl(userId) {
  if (!userId) return '/images/blank_avatar.jpg';

  if (window.profilePictures && window.profilePictures.getProfilePictureUrl) {
    try {
      const url = await window.profilePictures.getProfilePictureUrl(userId);
      return url || '/images/blank_avatar.jpg';
    } catch (error) {
      console.error('Error getting profile picture:', error);
    }
  }

  return '/images/blank_avatar.jpg';
}

// Export functions to window
window.getCohortByCode = getCohortByCode;
window.getStudentsByCohort = getStudentsByCohort;
window.getAllCohorts = getAllCohorts;
window.updateCohort = updateCohort;
window.calculateCohortProgress = calculateCohortProgress;
window.getStudentProgressDetails = getStudentProgressDetails;
window.getUserByEmail = getUserByEmail;
window.getUserById = getUserById;
window.getProfilePictureUrl = getProfilePictureUrl;

console.log('✅ Cohort management initialized (DynamoDB)');

// Made with Bob