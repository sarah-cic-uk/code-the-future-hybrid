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
    query ListUsers($cohortCode: String!, $nextToken: String) {
      listUsers(filter: { cohortId: { eq: $cohortCode } }, nextToken: $nextToken) {
        items {
          id
          email
          displayName
          progress
          profile
          cohortId
        }
        nextToken
      }
    }
  `;

  const all = [];
  let nextToken = null;
  try {
    do {
      const data = await executeGraphQL(query, { cohortCode, nextToken });
      all.push(...data.listUsers.items);
      nextToken = data.listUsers.nextToken;
    } while (nextToken);
    return all;
  } catch (error) {
    console.error('Error getting students:', error);
    return [];
  }
}

/**
 * Get teachers for a cohort. Teachers register with a schoolPrefix (e.g. "nepal")
 * and are linked to every cohort whose code starts with that prefix.
 */
async function getTeachersByCohort(cohortCode) {
  const query = `
    query ListUsers($nextToken: String) {
      listUsers(filter: { isTeacher: { eq: true } }, nextToken: $nextToken) {
        items {
          id
          email
          displayName
          schoolPrefix
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
    const code = cohortCode.toLowerCase();
    return all.filter(t => t.schoolPrefix && code.startsWith(t.schoolPrefix.toLowerCase()));
  } catch (error) {
    console.error('Error getting teachers:', error);
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
 * Get all students whose cohort starts with a school prefix (case-insensitive).
 * Used so a teacher's "My Cohort" page shows every student across their school's cohorts.
 */
async function getStudentsBySchoolPrefix(prefix) {
  if (!prefix) return [];
  const p = prefix.toLowerCase();
  const all = await getAllStudents();
  return all.filter(s => (s.cohortId || '').toLowerCase().startsWith(p));
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
          // Bonus sessions still show in the per-session stats, but don't
          // count toward the student's overall completion percentage.
          if (!OPTIONAL_SESSIONS.includes(sessionKey)) completedSessions++;
          stats.sessionStats[sessionKey].completed++;
        } else if (progress[sessionKey].lastAccessed) {
          stats.sessionStats[sessionKey].inProgress++;
        }
      }
    }

    const percentage = (completedSessions / REQUIRED_SESSION_COUNT) * 100;
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
  session1: ['session1-overview', 'introIDE', 'introGit', 'firstRepo', 'hostingGithub', 'gitVScode', 'gitTerminal', 'sshVsHttps', 'githubDesktop'],
  session2: ['session2-overview', 'htmlBasics', 'firstWebpage', 'chromeDevTools'],
  session3: ['session3-overview', 'html_images', 'html_tables', 'html_forms', 'html_hyperlinks'],
  session4: ['session4-overview', 'introToCSS', 'layoutsInCSS', 'advancedCSS', 'cssActivities'],
  session5: ['session5-overview', 'accessibility', 'accessibilityTools', 'accessibilityExample'],
  session6: ['session6-overview', 'projectPlanning', 'additionalHelp'],
  session7: ['session7-overview', 'goodUses', 'humanFirst', 'promptPractice', 'modelsTokensCosts', 'reviewAndRepeat', 'furtherLearning']
};
const OPTIONAL_LESSONS = {
  session1: ['sshVsHttps', 'githubDesktop'],
  session5: ['accessibilityExample'],
  session7: ['furtherLearning']
};

// Whole sessions that are optional (a "bonus" the student doesn't need for
// course completion). Session 7 (AI tools) is a bonus session, so it is
// excluded from the overall completeness count. Keep in sync with sidenav.js.
const OPTIONAL_SESSIONS = ['session7'];

// Number of sessions that actually count toward course completion.
const TOTAL_SESSIONS = 7;
const REQUIRED_SESSION_COUNT = TOTAL_SESSIONS - OPTIONAL_SESSIONS.length;

// The lessons within a session that count toward *that session's* completion
// (excludes the overview page and any lessons flagged optional). This is used
// for the per-session tick even on bonus sessions.
function sessionRequiredLessons(sessionKey) {
  const optional = OPTIONAL_LESSONS[sessionKey] || [];
  return (COURSE_LESSONS[sessionKey] || []).filter(
    name => !optional.includes(name) && !name.endsWith('-overview')
  );
}

function requiredLessonsFor(sessionKey) {
  // A bonus session has no lessons that are required for course completion.
  if (OPTIONAL_SESSIONS.includes(sessionKey)) return [];
  return sessionRequiredLessons(sessionKey);
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

  for (let i = 1; i <= TOTAL_SESSIONS; i++) {
    const sessionKey = `session${i}`;
    const raw = progress[sessionKey] || {};
    const isBonus = OPTIONAL_SESSIONS.includes(sessionKey);

    // For a bonus session, "complete" means the student finished all of its
    // lessons — it just doesn't count toward the overall total.
    const done = raw.completedLessons || {};
    const complete = isBonus
      ? sessionRequiredLessons(sessionKey).every(name => done[name])
      : isSessionComplete(sessionKey, progress);

    sessions[sessionKey] = {
      completed: complete,
      optional: isBonus,
      lastAccessed: raw.lastAccessed || null,
      completedDate: raw.completedDate || null,
      completedLessons: raw.completedLessons || {}
    };

    // Only required sessions count toward course completion.
    if (!isBonus && complete) completedCount++;
    if (raw.lastAccessed && raw.lastAccessed > lastAccessedDate) lastAccessedDate = raw.lastAccessed;
  }

  let status = 'Not Started';
  if (completedCount === REQUIRED_SESSION_COUNT) status = 'Completed';
  else if (completedCount > 0 || lastAccessedDate > 0) status = 'In Progress';

  return {
    completedSessions: completedCount,
    completedCount,
    totalSessions: REQUIRED_SESSION_COUNT,
    percentage: Math.round((completedCount / REQUIRED_SESSION_COUNT) * 100),
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
    const isBonusSession = OPTIONAL_SESSIONS.includes(key);
    const anyActivity = Object.keys(doneLessons).length > 0 || s.lastAccessed;

    const statusClass = s.completed ? 'completed' : (anyActivity ? 'in-progress' : 'not-started');
    const statusIcon = s.completed ? '✓' : (anyActivity ? '◐' : '○');
    const doneCount = lessons.filter(l => doneLessons[l]).length;

    const lessonItems = lessons.map(l => {
      const isDone = !!doneLessons[l];
      // A lesson is optional if flagged individually, or if its whole session is a bonus.
      const isOpt = optional.includes(l) || isBonusSession;
      return `<li>${isDone ? '✅' : '⬜'} ${prettyLessonName(l)}${isOpt ? ' <span class="text-muted">(optional)</span>' : ''}</li>`;
    }).join('');

    const sessionOptionalTag = isBonusSession
      ? ' <span class="text-muted small">(optional bonus — not counted)</span>'
      : '';

    sessionsHTML += `
      <div class="session-detail-item ${statusClass}">
        <strong>${statusIcon} ${SESSION_TITLES[key] || key}</strong>${sessionOptionalTag}
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
  // Email lookups are a DynamoDB scan + post-filter, capped at one page (~1MB) per
  // request. With enough users the match can sit past the first page, so follow
  // nextToken until found (email is unique → stop on the first matching page).
  const query = `
    query ListUsers($email: String!, $nextToken: String) {
      listUsers(filter: { email: { eq: $email } }, nextToken: $nextToken) {
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
        nextToken
      }
    }
  `;

  try {
    let nextToken = null;
    do {
      const data = await executeGraphQL(query, { email, nextToken });
      const users = data.listUsers.items;
      if (users.length > 0) return users[0];
      nextToken = data.listUsers.nextToken;
    } while (nextToken);
    return null;
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

/**
 * Submit student feedback. Emails the team via SES (sendFeedback mutation).
 * Name/email are pulled from the logged-in user in localStorage.
 * @param {{category?: string, lesson?: string, message: string}} feedback
 */
async function sendFeedback({ category, lesson, message }) {
  const userName = localStorage.getItem('displayName') || '';
  const userEmail = localStorage.getItem('userEmail') || '';
  const mutation = `
    mutation SendFeedback(
      $category: String, $lesson: String, $message: String!,
      $userName: String, $userEmail: String
    ) {
      sendFeedback(
        category: $category, lesson: $lesson, message: $message,
        userName: $userName, userEmail: $userEmail
      )
    }
  `;
  const data = await executeGraphQL(mutation, {
    category: category || null,
    lesson: lesson || null,
    message,
    userName,
    userEmail,
  });
  return data.sendFeedback;
}

// ---------------------------------------------------------------------------
// Session unlock (release) dates
// Stored on the Cohort as sessionReleaseDates: { session1: <ms>, ... } where the
// value is a millisecond timestamp (0 = available immediately). app.js's
// checkReleaseDates() compares Date.now() < releaseDates[sessionN].
// ---------------------------------------------------------------------------
const SESSION_KEYS = ['session1', 'session2', 'session3', 'session4', 'session5', 'session6', 'session7'];
const SESSION_LABELS = {
  session1: 'Session 1', session2: 'Session 2', session3: 'Session 3',
  session4: 'Session 4', session5: 'Session 5', session6: 'Session 6', session7: 'Session 7'
};

function parseSessionReleaseDates(raw) {
  if (!raw) return {};
  try {
    return typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch (e) {
    console.error('Could not parse sessionReleaseDates:', e);
    return {};
  }
}

// Convert a millisecond timestamp into a value for <input type="datetime-local">
// (local time, "YYYY-MM-DDTHH:mm"). Returns '' when there is no date set.
function msToDatetimeLocal(ms) {
  const n = Number(ms);
  if (!n || isNaN(n)) return '';
  const d = new Date(n);
  if (isNaN(d.getTime())) return '';
  const pad = (x) => String(x).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// Build the datetime-local inputs (one per session) for the unlock-dates modal,
// prefilled from the cohort's current sessionReleaseDates.
function buildReleaseDatesFieldsHTML(raw) {
  const dates = parseSessionReleaseDates(raw);
  return SESSION_KEYS.map((key) => {
    const val = msToDatetimeLocal(dates[key]);
    return `
      <div class="mb-3 row align-items-center">
        <label class="col-sm-4 col-form-label" for="release-${key}">${SESSION_LABELS[key]}</label>
        <div class="col-sm-8">
          <input type="datetime-local" class="form-control release-date-input"
            id="release-${key}" data-session="${key}" value="${val}" />
        </div>
      </div>`;
  }).join('');
}

// Read the modal inputs back into a { session1: ms, ... } object.
// An empty field becomes 0, meaning "unlocked immediately".
function collectReleaseDatesFromForm() {
  const result = {};
  document.querySelectorAll('.release-date-input').forEach((input) => {
    const key = input.getAttribute('data-session');
    const v = input.value;
    result[key] = v ? new Date(v).getTime() : 0;
  });
  return result;
}

// Export functions to window
window.getCohortByCode = getCohortByCode;
window.getStudentsByCohort = getStudentsByCohort;
window.getTeachersByCohort = getTeachersByCohort;
window.getAllStudents = getAllStudents;
window.getStudentsBySchoolPrefix = getStudentsBySchoolPrefix;
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
window.OPTIONAL_SESSIONS = OPTIONAL_SESSIONS;
window.createInterestRegistration = createInterestRegistration;
window.getInterestRegistrations = getInterestRegistrations;
window.sendFeedback = sendFeedback;
window.parseSessionReleaseDates = parseSessionReleaseDates;
window.msToDatetimeLocal = msToDatetimeLocal;
window.buildReleaseDatesFieldsHTML = buildReleaseDatesFieldsHTML;
window.collectReleaseDatesFromForm = collectReleaseDatesFromForm;

console.log('✅ Cohort management initialized (DynamoDB)');

// Made with Bob