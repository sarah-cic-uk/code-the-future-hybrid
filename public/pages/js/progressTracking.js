// Progress Tracking Utility for Code the Future
// Tracks student session completion and last accessed times
// Uses AWS DynamoDB via GraphQL API

/**
 * Get current user's email from localStorage
 * @returns {string|null} - User email or null
 */
function getCurrentUserEmail() {
  const email = localStorage.getItem('userEmail');
  if (!email) {
    console.error('No user email found in localStorage');
  }
  return email;
}

/**
 * Get GraphQL API configuration.
 * Cached after the first successful load so we don't re-fetch
 * /amplify_outputs.json on every single GraphQL call.
 * @returns {Promise<Object>} - API config
 */
let _apiConfigPromise = null;
async function getAPIConfig() {
  if (_apiConfigPromise) return _apiConfigPromise;

  _apiConfigPromise = (async () => {
    const response = await fetch('/amplify_outputs.json');
    const config = await response.json();
    return {
      endpoint: config.data.url,
      apiKey: config.data.api_key,
      region: config.data.aws_region
    };
  })();

  try {
    return await _apiConfigPromise;
  } catch (error) {
    _apiConfigPromise = null; // allow a retry on the next call
    console.error('Error loading API config:', error);
    throw error;
  }
}

/**
 * Execute GraphQL query/mutation
 * @param {string} query - GraphQL query string
 * @param {Object} variables - Query variables
 * @returns {Promise<Object>} - Query result
 */
async function executeGraphQL(query, variables = {}) {
  const config = await getAPIConfig();
  
  const response = await fetch(config.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.apiKey
    },
    body: JSON.stringify({
      query,
      variables
    })
  });

  const result = await response.json();
  
  if (result.errors) {
    console.error('GraphQL errors:', result.errors);
    throw new Error(result.errors[0].message);
  }
  
  return result.data;
}

/**
 * Get user by email
 * @param {string} email - User email
 * @returns {Promise<Object|null>} - User object or null
 */
// Internal: progress-only user lookup. Named distinctly so it does NOT
// shadow the global window.getUserByEmail from cohort-management.js
// (which returns the full record incl. isTutor/isTeacher/schoolPrefix).
async function getUserForProgress(email) {
  const query = `
    query ListUsers($email: String!) {
      listUsers(filter: { email: { eq: $email } }) {
        items {
          id
          email
          displayName
          progress
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
 * Update user progress in DynamoDB
 * @param {string} userId - User ID
 * @param {Object} progressData - Progress data object
 * @returns {Promise<boolean>} - Success status
 */
async function updateUserProgress(userId, progressData) {
  const mutation = `
    mutation UpdateUser($id: ID!, $progress: AWSJSON!) {
      updateUser(input: { id: $id, progress: $progress }) {
        id
        progress
      }
    }
  `;

  try {
    await executeGraphQL(mutation, {
      id: userId,
      progress: JSON.stringify(progressData)
    });
    return true;
  } catch (error) {
    console.error('Error updating progress:', error);
    return false;
  }
}

/**
 * Track when a student accesses a session
 * @param {number} sessionNumber - The session number (1-7)
 */
async function trackSessionAccess(sessionNumber) {
  const email = getCurrentUserEmail();
  if (!email) return;

  try {
    const user = await getUserForProgress(email);
    if (!user) {
      console.error('User not found');
      return;
    }

    // Parse existing progress
    const currentProgress = user.progress ? JSON.parse(user.progress) : {};
    const sessionKey = `session${sessionNumber}`;
    
    // Update last accessed time, preserve completion status
    currentProgress[sessionKey] = {
      ...currentProgress[sessionKey],
      lastAccessed: Date.now(),
      completed: currentProgress[sessionKey]?.completed || false
    };

    await updateUserProgress(user.id, currentProgress);
  } catch (error) {
    console.error('Error tracking session access:', error);
  }
}

/**
 * Check if a session is marked as complete
 * @param {number} sessionNumber - The session number (1-7)
 * @returns {Promise<Object>} - Progress data or null
 */
async function checkSessionCompletion(sessionNumber) {
  const email = getCurrentUserEmail();
  if (!email) return null;

  try {
    const user = await getUserForProgress(email);
    if (!user) return null;

    const progress = user.progress ? JSON.parse(user.progress) : {};
    const sessionKey = `session${sessionNumber}`;
    
    return progress[sessionKey] || null;
  } catch (error) {
    console.error('Error checking session completion:', error);
    return null;
  }
}

/**
 * Mark a session as complete
 * @param {number} sessionNumber - The session number (1-7)
 * @returns {Promise<boolean>} - Success status
 */
async function markSessionComplete(sessionNumber) {
  const email = getCurrentUserEmail();
  if (!email) return false;

  try {
    const user = await getUserForProgress(email);
    if (!user) {
      console.error('User not found');
      return false;
    }

    // Parse existing progress
    const currentProgress = user.progress ? JSON.parse(user.progress) : {};
    const sessionKey = `session${sessionNumber}`;
    
    // Mark as complete
    currentProgress[sessionKey] = {
      completed: true,
      completedDate: Date.now(),
      lastAccessed: Date.now()
    };

    return await updateUserProgress(user.id, currentProgress);
  } catch (error) {
    console.error('Error marking session complete:', error);
    return false;
  }
}

/**
 * Get all progress for current user
 * @returns {Promise<Object>} - All progress data
 */
async function getAllProgress() {
  const email = getCurrentUserEmail();
  if (!email) return {};

  try {
    const user = await getUserForProgress(email);
    if (!user) return {};

    return user.progress ? JSON.parse(user.progress) : {};
  } catch (error) {
    console.error('Error getting all progress:', error);
    return {};
  }
}

/**
 * Calculate progress statistics
 * @param {Object} progressData - Progress data object
 * @returns {Object} - Statistics object
 */
function calculateProgressStats(progressData) {
  // Bonus sessions (e.g. the AI session) don't count toward course completion.
  const optionalSessions = window.SIDENAV_OPTIONAL_SESSIONS || ['session7'];
  const totalSessions = 7 - optionalSessions.length;
  let completedCount = 0;
  let lastAccessedDate = 0;

  for (let i = 1; i <= 7; i++) {
    const sessionKey = `session${i}`;
    if (progressData[sessionKey]) {
      if (progressData[sessionKey].completed && !optionalSessions.includes(sessionKey)) {
        completedCount++;
      }
      if (progressData[sessionKey].lastAccessed > lastAccessedDate) {
        lastAccessedDate = progressData[sessionKey].lastAccessed;
      }
    }
  }

  const percentage = Math.round((completedCount / totalSessions) * 100);
  
  let status = 'Not Started';
  if (completedCount === totalSessions) {
    status = 'Completed';
  } else if (completedCount > 0 || lastAccessedDate > 0) {
    status = 'In Progress';
  }

  return {
    completedCount,
    totalSessions,
    percentage,
    status,
    lastAccessedDate
  };
}

/**
 * Render a read-only progress indicator (Not Started / In Progress / Completed)
 * on a session introduction page, based on how many of that session's lessons
 * the student has completed. Replaces the old "Mark Session as Complete" button.
 * The status rule matches the teacher/admin view: complete when manually flagged
 * OR when every required lesson is done.
 * @param {number} sessionNumber - The session number (1-7)
 */
async function initializeSessionCompletionUI(sessionNumber) {
  // Record that the student accessed this session (drives recency / "In Progress")
  await trackSessionAccess(sessionNumber);

  const sessionKey = `session${sessionNumber}`;
  const allProgress = await getAllProgress();
  const sessionProgress = allProgress[sessionKey] || {};
  const completedLessons = Object.keys(sessionProgress.completedLessons || {});

  // Required lessons for this session — shared with the side-nav ticks so the
  // indicator and the sidebar always agree.
  const allLessons =
    (window.SIDENAV_ALL_LESSONS && window.SIDENAV_ALL_LESSONS[sessionKey]) || [];
  const optionalLessons =
    (window.SIDENAV_OPTIONAL_LESSONS && window.SIDENAV_OPTIONAL_LESSONS[sessionKey]) || [];
  // The session-overview (introduction) page is not a lesson, so it must not
  // count toward completion — otherwise a session could never read as complete.
  const requiredLessons = allLessons.filter(
    (name) => !optionalLessons.includes(name) && !name.endsWith('-overview')
  );
  const completedRequired = requiredLessons.filter((name) => completedLessons.includes(name));

  const isComplete =
    sessionProgress.completed === true ||
    (requiredLessons.length > 0 && completedRequired.length === requiredLessons.length);
  // Status is driven by lesson completion (not mere page access), so a freshly
  // opened session with no completed lessons still reads as "Not Started".
  const hasStarted = completedLessons.length > 0;

  // A bonus session (e.g. the AI session) is optional — it doesn't count
  // toward course completion, so make that obvious to the student.
  const isOptionalSession = (window.SIDENAV_OPTIONAL_SESSIONS || []).includes(sessionKey);

  let status, badgeClass, icon, subtext;
  if (isComplete) {
    status = 'Completed';
    badgeClass = 'bg-success';
    icon = 'bi-check-circle-fill';
    subtext = 'You’ve completed all the lessons in this session. Great work! 🎉';
  } else if (hasStarted) {
    status = 'In Progress';
    badgeClass = 'bg-warning text-dark';
    icon = 'bi-hourglass-split';
    subtext = requiredLessons.length
      ? `${completedRequired.length} of ${requiredLessons.length} lessons completed — keep going!`
      : 'Keep working through the lessons in this session.';
  } else {
    status = 'Not Started';
    badgeClass = 'bg-secondary';
    icon = 'bi-circle';
    subtext = 'Work through the lessons in this session to track your progress here.';
  }

  // Find or create the completion section
  let completionSection = document.getElementById('session-completion-section');

  if (!completionSection) {
    completionSection = document.createElement('div');
    completionSection.id = 'session-completion-section';
    completionSection.className = 'session-completion-section';

    // Try to insert before session navigation, or at end of embed-container
    const sessionNav = document.getElementById('session-navigation');
    const embedContainer = document.querySelector('.embed-container');

    if (sessionNav && embedContainer) {
      embedContainer.insertBefore(completionSection, sessionNav);
    } else if (embedContainer) {
      embedContainer.appendChild(completionSection);
    } else {
      console.error('Could not find suitable location for completion section');
      return;
    }
  }

  const optionalPill = isOptionalSession
    ? `<span class="session-status-badge badge bg-info text-dark">
         <i class="bi bi-star-fill"></i> Optional bonus session
       </span>`
    : '';
  const optionalNote = isOptionalSession
    ? `<p class="completion-status text-muted">This is a bonus session — it isn’t required to complete the course, but it’s well worth doing.</p>`
    : '';

  completionSection.innerHTML = `
    <div class="completion-card">
      <div class="completion-content">
        <h4>Session ${sessionNumber} Progress</h4>
        ${optionalPill}
        <span class="session-status-badge badge ${badgeClass}">
          <i class="bi ${icon}"></i> ${status}
        </span>
        <p class="completion-status">${subtext}</p>
        ${optionalNote}
      </div>
    </div>
  `;
}

/**
 * Handle mark complete button click
 * @param {number} sessionNumber - The session number (1-7)
 */
async function handleMarkComplete(sessionNumber) {
  const button = document.getElementById('markCompleteBtn');
  const status = document.getElementById('completionStatus');

  if (!button || !status) return;

  // Disable button and show loading
  button.disabled = true;
  button.textContent = 'Marking Complete...';

  const success = await markSessionComplete(sessionNumber);

  if (success) {
    button.className = 'btn btn-success';
    button.textContent = '✓ Completed';
    status.textContent = `Completed on ${new Date().toLocaleDateString()}`;
    
    // Show success message
    showCompletionMessage('Session marked as complete! Great work! 🎉');
  } else {
    button.disabled = false;
    button.textContent = 'Mark Session as Complete';
    showCompletionMessage('Error marking session complete. Please try again.', true);
  }
}

/**
 * Show a temporary message to the user
 * @param {string} message - Message to display
 * @param {boolean} isError - Whether this is an error message
 */
function showCompletionMessage(message, isError = false) {
  const existingMessage = document.getElementById('completion-message');
  if (existingMessage) {
    existingMessage.remove();
  }

  const messageDiv = document.createElement('div');
  messageDiv.id = 'completion-message';
  messageDiv.className = `alert ${isError ? 'alert-danger' : 'alert-success'} alert-dismissible fade show`;
  messageDiv.style.position = 'fixed';
  messageDiv.style.top = '80px';
  messageDiv.style.right = '20px';
  messageDiv.style.zIndex = '9999';
  messageDiv.style.minWidth = '300px';
  messageDiv.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  `;

  document.body.appendChild(messageDiv);

  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (messageDiv && messageDiv.parentNode) {
      messageDiv.remove();
    }
  }, 5000);
}

/**
 * Save lesson completion status
 * @param {string} sessionName - Session name (e.g., "session1")
 * @param {string} lessonName - Lesson name (e.g., "introIDE")
 * @returns {Promise<boolean>} - Success status
 */
async function saveLessonComplete(sessionName, lessonName) {
  const email = getCurrentUserEmail();
  if (!email) return false;

  try {
    const user = await getUserForProgress(email);
    if (!user) {
      console.error('User not found');
      return false;
    }

    // Parse existing progress
    const currentProgress = user.progress ? JSON.parse(user.progress) : {};
    
    // Initialize session object if it doesn't exist
    if (!currentProgress[sessionName]) {
      currentProgress[sessionName] = {};
    }
    
    // Initialize completedLessons if it doesn't exist
    if (!currentProgress[sessionName].completedLessons) {
      currentProgress[sessionName].completedLessons = {};
    }
    
    // Mark lesson as complete
    currentProgress[sessionName].completedLessons[lessonName] = true;
    currentProgress[sessionName].lastAccessed = Date.now();

    return await updateUserProgress(user.id, currentProgress);
  } catch (error) {
    console.error('Error saving lesson completion:', error);
    return false;
  }
}

/**
 * Check if a lesson is complete
 * @param {string} sessionName - Session name (e.g., "session1")
 * @param {string} lessonName - Lesson name (e.g., "introIDE")
 * @returns {Promise<boolean>} - Completion status
 */
async function isLessonComplete(sessionName, lessonName) {
  const email = getCurrentUserEmail();
  if (!email) return false;

  try {
    const user = await getUserForProgress(email);
    if (!user) return false;

    const progress = user.progress ? JSON.parse(user.progress) : {};
    
    return !!(progress[sessionName]?.completedLessons?.[lessonName]);
  } catch (error) {
    console.error('Error checking lesson completion:', error);
    return false;
  }
}

/**
 * Get all completed lessons for a session
 * @param {string} sessionName - Session name (e.g., "session1")
 * @returns {Promise<Object>} - Object with lesson names as keys, true as values
 */
async function getSessionCompletedLessons(sessionName) {
  const email = getCurrentUserEmail();
  if (!email) return {};

  try {
    const user = await getUserForProgress(email);
    if (!user) return {};

    const progress = user.progress ? JSON.parse(user.progress) : {};
    
    return progress[sessionName]?.completedLessons || {};
  } catch (error) {
    console.error('Error getting completed lessons:', error);
    return {};
  }
}

// Make functions available globally
window.trackSessionAccess = trackSessionAccess;
window.checkSessionCompletion = checkSessionCompletion;
window.markSessionComplete = markSessionComplete;
window.getAllProgress = getAllProgress;
window.calculateProgressStats = calculateProgressStats;
window.initializeSessionCompletionUI = initializeSessionCompletionUI;
window.handleMarkComplete = handleMarkComplete;

// Make lesson tracking functions available globally
window._saveLessonComplete = saveLessonComplete;
window._isLessonComplete = isLessonComplete;
window.getSessionCompletedLessons = getSessionCompletedLessons;

console.log('✅ Progress tracking initialized (DynamoDB)');

// Made with Bob
