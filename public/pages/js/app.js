
function auth(loginBtn, profileBtn, sessionsBtn) {
  if (localStorage.getItem('loggedIn') === "true") {
    if (loginBtn) loginBtn.style.display = "none";
    if (loginBtn) profileBtn.style.display = "block";
    if (sessionsBtn) sessionsBtn.style.display = "block";
    const profileName = localStorage.getItem('displayName')
    document.querySelector('#profileName').innerHTML = profileName;
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

function logout(fbAuth) {
  fbAuth.signOut().then(() => {
    localStorage.setItem('loggedIn', false);
    console.log(`${getPath()}/login.html`)
    window.location.replace(`${getPath()}pages/login.html`);
  }).catch((error) => {
    console.log("error signing out: ", error.message)
  });
};