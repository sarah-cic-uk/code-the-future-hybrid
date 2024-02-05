
function auth(loginBtn, profileBtn, sessionsBtn) {
  if (localStorage.getItem('loggedIn') === "true") {
    if (loginBtn) loginBtn.style.display = "none";
    if (loginBtn) profileBtn.style.display = "block";
    if (sessionsBtn) sessionsBtn.style.display = "block";
  }
  else {
    if (loginBtn) loginBtn.style.display = "block";
    if (loginBtn) profileBtn.style.display = "none";
    if (sessionsBtn) sessionsBtn.style.display = "none";
  }
}

function getPath() {
  const BASE_URL = window.location.origin;
  const PATH = BASE_URL.includes('github')
    ? '/code-the-future-hybrid/'
    : BASE_URL.includes('app') ? '/' : '/public/';
  return PATH;
}

function logout(auth) {
  auth.signOut().then(() => {
    console.log("Logged out ")
    localStorage.setItem('loggedIn', false);
  }).catch((error) => {
    console.log("error signing out: ", error.message)
  });
};