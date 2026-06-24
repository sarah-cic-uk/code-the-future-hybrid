// Clear any Firebase storage on page load
(function() {
  // Remove Firebase-specific session storage keys
  const sessionFirebaseKeys = [];
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key && (key.includes('firebase') || key.includes('Firebase'))) {
      sessionFirebaseKeys.push(key);
    }
  }
  sessionFirebaseKeys.forEach(key => sessionStorage.removeItem(key));
  
  // Remove Firebase-specific local storage keys
  const localFirebaseKeys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.includes('firebase') || key.includes('Firebase'))) {
      localFirebaseKeys.push(key);
    }
  }
  localFirebaseKeys.forEach(key => localStorage.removeItem(key));
})();

async function auth(loginBtn, profileBtn, sessionsBtn, needsAuth = true) {
  if (localStorage.getItem('loggedIn') === "true") {
    if (loginBtn) loginBtn.style.display = "none";
    if (profileBtn) profileBtn.style.display = "block";
    if (sessionsBtn) sessionsBtn.style.display = "inline-flex";
    const profileName = localStorage.getItem('displayName');
    if (document.querySelector('#profileName')) {
      document.querySelector('#profileName').innerHTML = profileName;
    }

    // Load profile pictures using Amplify
    // TODO: Re-enable when ES modules are working
    // try {
    //   const { checkAuth } = await import('./amplify-auth.js');
    //   const isAuthenticated = await checkAuth();
    //   if (isAuthenticated) {
    //     loadProfilePictures();
    //   }
    // } catch (error) {
    //   console.error('Auth check error:', error);
    // }
  } else {
    if (loginBtn) loginBtn.style.display = "block";
    if (profileBtn) profileBtn.style.display = "none";
    if (sessionsBtn) sessionsBtn.style.display = "none";
    if (needsAuth) {
      if (window.location.pathname.match(/.*\/(.*)$/)[1] !== "login.html") {
        window.location.replace(`${getPath()}pages/login.html`);
      }
    }
  }
}

function getPath() {
  const BASE_URL = window.location.origin;
  const PATH = BASE_URL.includes('github')
    ? '/code-the-future-hybrid/'
    : BASE_URL.includes('app')
      ? '/'
      : '/public/';
  return PATH;
}

document.addEventListener("DOMContentLoaded", injectSession7Nav);

function injectSession7Nav() {
  const navbar = document.querySelector(".navbar-nav.nav-justified");

  if (!navbar || navbar.querySelector('[name="session7-nav"]')) return;
  if (!navbar.querySelector('[name="session1-nav"]')) return;

  const session7Button = document.createElement("button");
  session7Button.className = "nav-link border-end border-dark";
  session7Button.name = "session7-nav";
  session7Button.setAttribute("aria-current", "page");
  session7Button.onclick = function () {
    createPath('pages/sessions/session7/introduction.html');
  };
  session7Button.innerHTML = 'AI Session<span id="session7-tooltip" class="box tooltip-text hidden">Session Opens Soon</span>';

  const showcaseButton = navbar.querySelector('[name="showcase-nav"]');
  if (showcaseButton) {
    navbar.insertBefore(session7Button, showcaseButton.nextSibling);
  } else {
    navbar.appendChild(session7Button);
  }
}

function logout() {
  // Clear all authentication data from localStorage
  localStorage.removeItem('loggedIn');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('displayName');
  localStorage.removeItem('cohort');
  localStorage.removeItem('idToken');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  
  console.log('✅ User logged out');
  
  // Redirect to login page
  window.location.replace(`${getPath()}pages/login.html`);
}

function updateSideNav() {
  const filename = window.location.pathname.match(/.*\/(.*)$/)[1];
  const name = filename.substring(0, filename.indexOf('.'));
  const session = window.location.pathname.match(/session\d/)[0];
  const submenu = 'submenu' + session.match(/\d/);

  document.getElementById(submenu).classList.add("show");
  document.getElementsByName(name)[0].classList.add("active-side-nav");
  document.getElementsByName(session)[0].classList.add("active-side-nav");
  document.getElementsByName(session + '-nav')[0].classList.add("active-top-nav");
}

function updateSideNavOverview() {
  const session = window.location.pathname.match(/session\d/)[0];
  const submenu = 'submenu' + session.match(/\d/);

  console.log(submenu);
  document.getElementById(submenu).classList.add("show");
  document.getElementsByName(session + '-overview')[0].classList.add("active-side-nav");
  document.getElementsByName(session)[0].classList.add("active-side-nav");
  document.getElementsByName(session + '-nav')[0].classList.add("active-top-nav");
}

async function checkReleaseDates() {
  try {
    const cohortCode = localStorage.getItem('cohort');
    if (!cohortCode) return;
    
    // Use cohort-management.js helper if available
    if (typeof window.getCohortByCode !== 'function') {
      console.warn('Cohort management not loaded');
      return;
    }
    
    const userCohort = await window.getCohortByCode(cohortCode);
    if (!userCohort) return;
    
    const releaseDates = typeof userCohort.sessionReleaseDates === 'string'
      ? JSON.parse(userCohort.sessionReleaseDates)
      : userCohort.sessionReleaseDates;
    
    if (!releaseDates) return;
    
    // Session buttons
    for (const btn of document.querySelectorAll(".release-date-btn")) {
      const session = btn.name.split('-')[1];
      if (Date.now() < releaseDates[session]) {
        btn.disabled = true;
        btn.style.float = 'right';
        btn.title = `Session Opens ${new Date(releaseDates[session]).toLocaleString().split(',')[0]}`;
      }
    }

    // Sidebar links
    for (const item of document.querySelectorAll(".nav-item button")) {
      if (Date.now() < releaseDates[item.name]) {
        item.disabled = true;
        item.classList.add('hover-text');
        const tooltip = document.getElementById(`${item.name}-tooltip`);
        if (tooltip) {
          tooltip.classList.remove('hidden');
          tooltip.innerHTML = `Session Opens ${new Date(releaseDates[item.name]).toLocaleString().split(',')[0]}`;
        }
      }
    }

    // navbar links
    for (const item of document.querySelectorAll(".navbar-nav button")) {
      const session = item.name.split('-')[0];
      if (releaseDates && Date.now() < releaseDates[session]) {
        item.disabled = true;
        item.classList.add('hover-text');
        document.getElementById(`${session}-tooltip`).classList.remove('hidden');
        document.getElementById(`${session}-tooltip`).innerHTML =
          `Session Opens ${new Date(releaseDates[session]).toLocaleString().split(',')[0]}`;
      }
    }
  } catch (error) {
    console.error('Error checking release dates:', error);
  }
}

function fetchMedia(pathReference, el) {
  pathReference.getDownloadURL()
    .then((url) => {
      el.setAttribute('src', url);
    })
    .catch((error) => {
      console.error("Error fetching media:", error);
    });
}

// Fetch media from Amplify Storage (for videos)
async function fetchMediaFromAmplify(videoName, el) {
  try {
    // Import getVideoUrl from amplify-storage module
    const { getVideoUrl } = await import('./amplify-storage.js');
    const url = await getVideoUrl(videoName);
    
    if (url) {
      el.setAttribute('src', url);
      console.log('✅ Video loaded from Amplify:', videoName);
    } else {
      console.error('❌ Failed to get video URL from Amplify:', videoName);
    }
  } catch (error) {
    console.error('Error fetching media from Amplify:', error);
  }
}

async function sendEmailRequest(to, subject, text, html) {
  // Validate email inputs
  if (!to || !subject || (!text && !html)) {
    console.error("Invalid email payload. 'To', 'Subject', and either 'Text' or 'HTML' are required.");
    return;
  }

  try {
    await emailjs.send('service_id', 'template_id', {
      to_email: to,
      subject: subject,
      message: html || text
    });
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

async function loadProfilePictures() {
  try {
    // Get current user from Cognito
    const { getCurrentUser } = await import('./amplify-auth.js');
    const user = await getCurrentUser();
    if (!user) return;

    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) return;

    // Load profile picture from Amplify Storage
    const { getProfilePictureUrl } = await import('./amplify-storage.js');
    const profilePicElements = document.querySelectorAll('img[id="profile-pic-avatar"]');
    
    // Use email as user ID for profile pictures
    const profilePicUrl = await getProfilePictureUrl(userEmail);
    
    if (profilePicUrl) {
      for (const el of profilePicElements) {
        el.setAttribute('src', profilePicUrl);
      }
    }

    // Check if user is a tutor/teacher and show/hide menu items
    const { generateClient } = await import('aws-amplify/data');
    const client = generateClient();
    
    const { data: users } = await client.models.User.list({
      filter: {
        email: { eq: userEmail }
      }
    });
    
    if (users && users.length > 0) {
      const userData = users[0];
      
      // Show tutor menu item for tutors (course creators)
      const tutorMenuItem = document.getElementById('tutor-menu-item');
      if (tutorMenuItem && userData.isTutor) {
        tutorMenuItem.style.display = 'block';
      }

      // Show teacher menu item for teachers (school teachers)
      const teacherMenuItem = document.getElementById('teacher-menu-item');
      if (teacherMenuItem && userData.isTeacher) {
        teacherMenuItem.style.display = 'block';
      }

      // Show admin menu item for tutors (course creators have admin access)
      const adminMenuItem = document.getElementById('admin-menu-item');
      if (adminMenuItem && userData.isTutor) {
        adminMenuItem.style.display = 'block';
      }

      // Ensure cohort data is in localStorage
      if (!localStorage.getItem('cohort') && userData.cohortId) {
        localStorage.setItem('cohort', userData.cohortId);
      }
      if (!localStorage.getItem('displayName') && userData.displayName) {
        localStorage.setItem('displayName', userData.displayName);
      }
    }
  } catch (error) {
    console.error('Error loading profile:', error);
  }
}

