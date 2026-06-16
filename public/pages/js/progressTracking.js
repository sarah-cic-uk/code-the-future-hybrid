// Progress Tracking Utility for Code the Future
// Tracks student session completion and last accessed times

/**
 * Track when a student accesses a session
 * @param {number} sessionNumber - The session number (1-7)
 */
async function trackSessionAccess(sessionNumber) {
  if (!window.fbAuth || !window.fbDB) {
    console.error('Firebase not initialized');
    return;
  }

  const user = window.fbAuth.currentUser;
  if (!user) {
    console.error('No user logged in');
    return;
  }

  try {
    const progressRef = window.fbDB.ref(`users/${user.uid}/progress/session${sessionNumber}`);
    const snapshot = await progressRef.once('value');
    const existingData = snapshot.val() || {};

    // Update last accessed time, preserve completion status
    await progressRef.update({
      lastAccessed: Date.now(),
      completed: existingData.completed || false
    });
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
  if (!window.fbAuth || !window.fbDB) {
    console.error('Firebase not initialized');
    return null;
  }

  const user = window.fbAuth.currentUser;
  if (!user) {
    console.error('No user logged in');
    return null;
  }

  try {
    const progressRef = window.fbDB.ref(`users/${user.uid}/progress/session${sessionNumber}`);
    const snapshot = await progressRef.once('value');
    return snapshot.val();
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
  if (!window.fbAuth || !window.fbDB) {
    console.error('Firebase not initialized');
    return false;
  }

  const user = window.fbAuth.currentUser;
  if (!user) {
    console.error('No user logged in');
    return false;
  }

  try {
    const progressRef = window.fbDB.ref(`users/${user.uid}/progress/session${sessionNumber}`);
    
    await progressRef.set({
      completed: true,
      completedDate: Date.now(),
      lastAccessed: Date.now()
    });

    return true;
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
  if (!window.fbAuth || !window.fbDB) {
    console.error('Firebase not initialized');
    return {};
  }

  const user = window.fbAuth.currentUser;
  if (!user) {
    console.error('No user logged in');
    return {};
  }

  try {
    const progressRef = window.fbDB.ref(`users/${user.uid}/progress`);
    const snapshot = await progressRef.once('value');
    return snapshot.val() || {};
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
  const totalSessions = 7;
  let completedCount = 0;
  let lastAccessedDate = 0;

  for (let i = 1; i <= totalSessions; i++) {
    const sessionKey = `session${i}`;
    if (progressData[sessionKey]) {
      if (progressData[sessionKey].completed) {
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
 * Initialize session completion UI on a session introduction page
 * @param {number} sessionNumber - The session number (1-7)
 */
async function initializeSessionCompletionUI(sessionNumber) {
  // Track that user accessed this session
  await trackSessionAccess(sessionNumber);

  // Check if already completed
  const progressData = await checkSessionCompletion(sessionNumber);

  // Find or create the completion section
  let completionSection = document.getElementById('session-completion-section');
  
  if (!completionSection) {
    // Create completion section if it doesn't exist
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

  // Build the UI
  const isCompleted = progressData && progressData.completed;
  const completedDate = progressData && progressData.completedDate 
    ? new Date(progressData.completedDate).toLocaleDateString() 
    : '';

  completionSection.innerHTML = `
    <div class="completion-card">
      <div class="completion-content">
        <h4>Session ${sessionNumber} Progress</h4>
        <button 
          id="markCompleteBtn" 
          class="btn ${isCompleted ? 'btn-success' : 'btn-primary'}"
          ${isCompleted ? 'disabled' : ''}
          onclick="handleMarkComplete(${sessionNumber})">
          ${isCompleted ? '✓ Completed' : 'Mark Session as Complete'}
        </button>
        <p id="completionStatus" class="completion-status">
          ${isCompleted ? `Completed on ${completedDate}` : 'Complete this session when you finish all lessons'}
        </p>
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

// Make functions available globally
window.trackSessionAccess = trackSessionAccess;
window.checkSessionCompletion = checkSessionCompletion;
window.markSessionComplete = markSessionComplete;
window.getAllProgress = getAllProgress;
window.calculateProgressStats = calculateProgressStats;
window.initializeSessionCompletionUI = initializeSessionCompletionUI;
window.handleMarkComplete = handleMarkComplete;

// Made with Bob
