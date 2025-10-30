function auth(loginBtn, profileBtn, sessionsBtn, needsAuth = true) {
  if (localStorage.getItem('loggedIn') === "true") {
    if (loginBtn) loginBtn.style.display = "none";
    if (profileBtn) profileBtn.style.display = "block";
    if (sessionsBtn) sessionsBtn.style.display = "inline-flex";
    const profileName = localStorage.getItem('displayName');
    document.querySelector('#profileName').innerHTML = profileName;

    // Load profile pictures for all profile-pic-avatar elements
    if (window.fbAuth && window.fbStorage) {
      window.fbAuth.onAuthStateChanged(user => {
        if (user) loadProfilePictures();
      });
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

function logout(fbAuth) {
  fbAuth.signOut().then(() => {
    localStorage.setItem('loggedIn', false);
    window.location.replace(`${getPath()}pages/login.html`);
  }).catch((error) => {
    console.log("error signing out: ", error.message);
  });
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

async function checkReleaseDates(fbDB) {
  const cohortsSnapshot = await fbDB.ref("/cohorts").once("value");
  const allCohorts = cohortsSnapshot.val();
  const userCohort = Object.values(allCohorts).find(cohort => cohort.code === window.localStorage.cohort);
  console.log(document.querySelectorAll(".release-date-btn"))
  if (!userCohort) return;
  // session buttons
  for (const btn of document.querySelectorAll(".release-date-btn")) {
    console.log(btn)
    const session = btn.name.split('-')[1];
console.log( userCohort.sessionReleaseDates[session])
console.log( session)

    if (Date.now() < userCohort.sessionReleaseDates[session]) {
      btn.disabled = true;
      btn.style.float = 'right';
      btn.title = `Session Opens ${new Date(userCohort.sessionReleaseDates[session]).toLocaleString().split(',')[0]}`;
    }
  }

  // sidebar links
  for (const item of document.querySelectorAll(".nav-item button")) {
    if (userCohort.sessionReleaseDates && Date.now() < userCohort.sessionReleaseDates[item.name]) {
      item.disabled = true;
      item.classList.add('hover-text');
      document.getElementById(`${item.name}-tooltip`).classList.remove('hidden');
      document.getElementById(`${item.name}-tooltip`).innerHTML =
        `Session Opens ${new Date(userCohort.sessionReleaseDates[item.name]).toLocaleString().split(',')[0]}`;
    }
  }

  // navbar links
  for (const item of document.querySelectorAll(".navbar-nav button")) {
    const session = item.name.split('-')[0];
    if (userCohort.sessionReleaseDates && Date.now() < userCohort.sessionReleaseDates[session]) {
      item.disabled = true;
      item.classList.add('hover-text');
      document.getElementById(`${session}-tooltip`).classList.remove('hidden');
      document.getElementById(`${session}-tooltip`).innerHTML =
        `Session Opens ${new Date(userCohort.sessionReleaseDates[session]).toLocaleString().split(',')[0]}`;
    }
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
  const currentUser = window.fbAuth.currentUser;
  if (!currentUser) return;

  const profilePicElements = document.querySelectorAll('img[id="profile-pic-avatar"]');
  const pathReference = window.fbStorage.ref("profilePics/" + currentUser.uid);

  for (const el of profilePicElements) {
    fetchMedia(pathReference, el);
  }

  // Check if user is a tutor and show/hide tutor menu item
  try {
    const userSnapshot = await window.fbDB.ref(`users/${currentUser.uid}`).once('value');
    const userData = userSnapshot.val();
    const tutorMenuItem = document.getElementById('tutor-menu-item');

    if (tutorMenuItem && userData && userData.tutor) {
      tutorMenuItem.style.display = 'block';
    }
  } catch (error) {
    console.error('Error checking tutor status:', error);
  }
}

