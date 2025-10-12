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
  const userCohort = await fbDB
    .ref("/cohorts")
    .child(window.localStorage.cohort)
    .once("value")
    .then((snapshot) => snapshot.val())
    .catch((error) => ({
      errorCode: error.code,
      errorMessage: error.message
    }));

  // session buttons
  document.querySelectorAll(".release-date-btn").forEach((btn) => {
    if (Date.now() < userCohort.sessionReleaseDates[btn.name]) {
      btn.disabled = true;
      btn.classList.add('hover-text');
      document.getElementById(`${btn.name}-btn-tooltip`).classList.remove('hidden');
      document.getElementById(`${btn.name}-btn-tooltip`).innerHTML =
        `Session Opens ${new Date(userCohort.sessionReleaseDates[btn.name]).toLocaleString().split(',')[0]}`;
    }
  });

  // sidebar links
  document.querySelectorAll(".nav-item button").forEach((item) => {
    if (Date.now() < userCohort.sessionReleaseDates[item.name]) {
      item.disabled = true;
      item.classList.add('hover-text');
      document.getElementById(`${item.name}-tooltip`).classList.remove('hidden');
      document.getElementById(`${item.name}-tooltip`).innerHTML =
        `Session Opens ${new Date(userCohort.sessionReleaseDates[item.name]).toLocaleString().split(',')[0]}`;
    }
  });

  // navbar links
  document.querySelectorAll(".navbar-nav button").forEach((item) => {
    const session = item.name.split('-')[0];
    if (Date.now() < userCohort.sessionReleaseDates[session]) {
      item.disabled = true;
      item.classList.add('hover-text');
      document.getElementById(`${session}-tooltip`).classList.remove('hidden');
      document.getElementById(`${session}-tooltip`).innerHTML =
        `Session Opens ${new Date(userCohort.sessionReleaseDates[session]).toLocaleString().split(',')[0]}`;
    }
  });
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

  const emailPayload = {
    to,
    subject,
    text,
    html,
  };

  try {
    const response = await fetch('https://code-the-future-hybrid.web.app/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload),
    });

    if (response.ok) {
      const result = await response.json();
      console.log("Email sent successfully:", result);
    } else {
      console.error("Failed to send email. Server response:", await response.text());
    }
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

async function loadProfilePictures() {
  const currentUser = window.fbAuth.currentUser;
  if (!currentUser) return;
  
  const profilePicElements = document.querySelectorAll('img[id="profile-pic-avatar"]');
  const pathReference = window.fbStorage.ref("profilePics/" + currentUser.uid);
  
  profilePicElements.forEach(el => fetchMedia(pathReference, el));
}