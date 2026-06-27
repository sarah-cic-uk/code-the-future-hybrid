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
 * Get all students across every cohort (paginated). Used by the showcase page.
 */
async function getAllStudents() {
  const query = `
    query ListUsers($nextToken: String) {
      listUsers(nextToken: $nextToken) {
        items {
          id
          email
          displayName
          cohortId
          progress
          profile
        }
        nextToken
      }
    }
  `;

  const all = [];
  let nextToken = null;
  try {
    do {
      const data = await executeGraphQL(query, { nextToken });
      all.push(...data.listUsers.items);
      nextToken = data.listUsers.nextToken;
    } while (nextToken);
    return all;
  } catch (error) {
    console.error('Error getting all students:', error);
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
  session7: ['session7-overview', 'goodUses', 'humanFirst', 'promptPractice', 'modelsTokensCosts', 'reviewAndRepeat', 'furtherLearning']
};
const OPTIONAL_LESSONS = {
  session1: ['gitTerminal', 'githubDesktop'],
  session5: ['accessibilityExample'],
  session6: ['additionalHelp'],
  session7: ['furtherLearning']
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

const SESSION_TITLES = {
  session1: 'Session 1: Dev Environment',
  session2: 'Session 2: HTML Basics',
  session3: 'Session 3: HTML Advanced',
  session4: 'Session 4: CSS Styling',
  session5: 'Session 5: Accessibility',
  session6: 'Session 6: Final Project',
  session7: 'Session 7: AI Tools'
};

// Turn a lesson key into a readable label, e.g. "html_images" -> "Html Images"
function prettyLessonName(key) {
  if (/-overview$/.test(key)) return 'Session overview';
  return key
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, c => c.toUpperCase());
}

/**
 * Build the HTML for a student progress modal, including a per-lesson
 * breakdown within each session. Shared by the teacher and admin dashboards.
 * `student` is the shape produced in those pages: { name, email, progress, progressData }.
 */
function buildStudentDetailHTML(student) {
  const sessions = student.progressData || {};
  const p = student.progress || {};

  let sessionsHTML = '';
  for (let i = 1; i <= 7; i++) {
    const key = `session${i}`;
    const s = sessions[key] || {};
    const doneLessons = s.completedLessons || {};
    const lessons = COURSE_LESSONS[key] || [];
    const optional = OPTIONAL_LESSONS[key] || [];
    const anyActivity = Object.keys(doneLessons).length > 0 || s.lastAccessed;

    const statusClass = s.completed ? 'completed' : (anyActivity ? 'in-progress' : 'not-started');
    const statusIcon = s.completed ? '✓' : (anyActivity ? '◐' : '○');
    const doneCount = lessons.filter(l => doneLessons[l]).length;

    const lessonItems = lessons.map(l => {
      const isDone = !!doneLessons[l];
      const isOpt = optional.includes(l);
      return `<li>${isDone ? '✅' : '⬜'} ${prettyLessonName(l)}${isOpt ? ' <span class="text-muted">(optional)</span>' : ''}</li>`;
    }).join('');

    sessionsHTML += `
      <div class="session-detail-item ${statusClass}">
        <strong>${statusIcon} ${SESSION_TITLES[key] || key}</strong>
        <span class="text-muted small"> — ${doneCount}/${lessons.length} lessons</span>
        <ul class="list-unstyled ms-4 mt-2 mb-0">${lessonItems}</ul>
      </div>`;
  }

  const statusClass = (p.status || '').toLowerCase().replace(' ', '-');
  return `
    <div class="mb-4">
      <h5>${student.name || ''}</h5>
      <p class="text-muted mb-2">${student.email || ''}</p>
      <div class="mb-3">
        <strong>Overall Progress:</strong>
        <div class="progress-bar-container mt-2">
          <div class="progress-bar-fill" style="width: ${p.percentage || 0}%">${p.percentage || 0}%</div>
        </div>
      </div>
      <p><strong>Status:</strong> <span class="status-badge status-${statusClass}">${p.status || ''}</span></p>
      <p><strong>Sessions Completed:</strong> ${p.completedCount || 0} / ${p.totalSessions || 7}</p>
    </div>
    <hr>
    <h6 class="mb-3">Session &amp; Lesson Details:</h6>
    ${sessionsHTML}
  `;
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
          isAdmin
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

/**
 * Save an "interest registration" for someone without a cohort code.
 */
async function createInterestRegistration(name, email) {
  const mutation = `
    mutation CreateInterestRegistration($input: CreateInterestRegistrationInput!) {
      createInterestRegistration(input: $input) {
        id name email status registeredAt
      }
    }
  `;
  const data = await executeGraphQL(mutation, {
    input: { name, email, status: 'new', registeredAt: new Date().toISOString() }
  });
  return data.createInterestRegistration;
}

/**
 * List all interest registrations (newest first). Admin-only view.
 */
async function getInterestRegistrations() {
  const query = `
    query ListInterestRegistrations($nextToken: String) {
      listInterestRegistrations(nextToken: $nextToken) {
        items { id name email status registeredAt }
        nextToken
      }
    }
  `;
  const all = [];
  let nextToken = null;
  try {
    do {
      const data = await executeGraphQL(query, { nextToken });
      all.push(...data.listInterestRegistrations.items);
      nextToken = data.listInterestRegistrations.nextToken;
    } while (nextToken);
  } catch (error) {
    console.error('Error getting interest registrations:', error);
    return [];
  }
  // Newest first
  all.sort((a, b) => (b.registeredAt || '').localeCompare(a.registeredAt || ''));
  return all;
}

// Export functions to window
window.getCohortByCode = getCohortByCode;
window.getStudentsByCohort = getStudentsByCohort;
window.getAllStudents = getAllStudents;
window.getAllCohorts = getAllCohorts;
window.updateCohort = updateCohort;
window.calculateCohortProgress = calculateCohortProgress;
window.getStudentProgressDetails = getStudentProgressDetails;
window.getUserByEmail = getUserByEmail;
window.getUserById = getUserById;
window.getProfilePictureUrl = getProfilePictureUrl;
window.buildStudentDetailHTML = buildStudentDetailHTML;
window.COURSE_LESSONS = COURSE_LESSONS;
window.OPTIONAL_LESSONS = OPTIONAL_LESSONS;
window.createInterestRegistration = createInterestRegistration;
window.getInterestRegistrations = getInterestRegistrations;

console.log('✅ Cohort management initialized (DynamoDB)');

// Made with Bob