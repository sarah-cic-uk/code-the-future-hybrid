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

    // Presigned URLs expire (1hr); only use the cached one while still valid
    const cachedPic = localStorage.getItem('profilePicUrl');
    const cachedPicExpiry = parseInt(localStorage.getItem('profilePicUrlExpiry') || '0', 10);
    if (cachedPic && Date.now() < cachedPicExpiry) {
      document.querySelectorAll('#profile-pic-avatar').forEach(el => el.src = cachedPic);
    }

    // Add role dashboard links to the profile dropdown on every page
    if (localStorage.getItem('isTeacher') === 'true') {
      showRoleMenuItem('teacher-menu-item', 'My Cohorts', 'pages/teacherCohortView.html');
    }
    if (localStorage.getItem('isTutor') === 'true') {
      showRoleMenuItem('admin-menu-item', 'All Cohorts (Admin)', 'pages/adminCohortView.html');
    }
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

// Ensure a role-specific dashboard link is present (and visible) in the profile
// dropdown on any page. If the page already hardcodes the <li>, just show it;
// otherwise inject it before the Log out item. relPath is resolved via getPath().
function showRoleMenuItem(id, label, relPath) {
  const existing = document.getElementById(id);
  if (existing) {
    existing.style.display = 'block';
    return;
  }

  const menu = document.querySelector('.profileBtn .dropdown-menu')
    || document.querySelector('.dropdown-menu');
  if (!menu) return;

  const item = document.createElement('li');
  item.id = id;
  item.innerHTML = `<a class="dropdown-item" href="${getPath()}${relPath}">${label}</a>`;

  const logoutItem = Array.from(menu.querySelectorAll('li'))
    .find(li => /logout|logUserOut/i.test(li.innerHTML));
  if (logoutItem) menu.insertBefore(item, logoutItem);
  else menu.appendChild(item);
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
  localStorage.removeItem('userId');
  localStorage.removeItem('profilePicUrl');
  localStorage.removeItem('profilePicUrlExpiry');
  localStorage.removeItem('isTeacher');
  localStorage.removeItem('isTutor');
  localStorage.removeItem('schoolPrefix');
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



