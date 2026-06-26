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
 * Get individual student progress details
 */
function getStudentProgressDetails(student) {
  if (!student.progress) {
    return {
      completedSessions: 0,
      totalSessions: 7,
      percentage: 0,
      sessions: {}
    };
  }
  
  const progress = typeof student.progress === 'string' 
    ? JSON.parse(student.progress) 
    : student.progress;
  
  let completedCount = 0;
  const sessions = {};
  
  for (let i = 1; i <= 7; i++) {
    const sessionKey = `session${i}`;
    sessions[sessionKey] = {
      completed: progress[sessionKey]?.completed || false,
      lastAccessed: progress[sessionKey]?.lastAccessed || null,
      completedDate: progress[sessionKey]?.completedDate || null
    };
    
    if (sessions[sessionKey].completed) {
      completedCount++;
    }
  }
  
  return {
    completedSessions: completedCount,
    totalSessions: 7,
    percentage: Math.round((completedCount / 7) * 100),
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
 * Get profile picture URL from S3
 * @param {string} userId - DynamoDB user ID
 * @returns {Promise<string>} - Profile picture URL or default
 */
async function getProfilePictureUrl(userId) {
  if (!userId) return '/images/blank_avatar.jpg';

  try {
    if (window.amplifyStorage && window.amplifyStorage.getProfilePictureUrl) {
      const url = await window.amplifyStorage.getProfilePictureUrl(userId);
      if (url) return url;
    }

    const response = await fetch('/amplify_outputs.json');
    const config = await response.json();
    const bucket = config.storage.bucket_name;
    const region = config.storage.aws_region;
    const url = `https://${bucket}.s3.${region}.amazonaws.com/profile-pictures/${userId}`;

    const testResponse = await fetch(url, { method: 'HEAD' });
    if (testResponse.ok) return url;

    return '/images/blank_avatar.jpg';
  } catch (error) {
    console.error('Error getting profile picture:', error);
    return '/images/blank_avatar.jpg';
  }
}

// Export functions to window
window.getCohortByCode = getCohortByCode;
window.getStudentsByCohort = getStudentsByCohort;
window.getAllCohorts = getAllCohorts;
window.updateCohort = updateCohort;
window.calculateCohortProgress = calculateCohortProgress;
window.getStudentProgressDetails = getStudentProgressDetails;
window.getUserByEmail = getUserByEmail;
window.getProfilePictureUrl = getProfilePictureUrl;

console.log('✅ Cohort management initialized (DynamoDB)');

// Made with Bob