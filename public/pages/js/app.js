
function auth(loginBtn, profileBtn, sessionsBtn) {
  if (localStorage.getItem('loggedIn') === "true") {
    if (loginBtn) loginBtn.style.display = "none";
    if (loginBtn) profileBtn.style.display = "block";
    if (sessionsBtn) sessionsBtn.style.display = "inline-flex";
    const profileName = localStorage.getItem('displayName')
    document.querySelector('#profileName').innerHTML = profileName;
  }
  else {
    if (loginBtn) loginBtn.style.display = "block";
    if (loginBtn) profileBtn.style.display = "none";
    if (sessionsBtn) sessionsBtn.style.display = "none";
    if(window.location.pathname.match(/.*\/(.*)$/)[1] !== "login.html") {window.location.replace(`${getPath()}pages/login.html`)};
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
    window.location.replace(`${getPath()}pages/login.html`);
  }).catch((error) => {
    console.log("error signing out: ", error.message)
  });
};

function updateSideNav() {
  const filename = window.location.pathname.match(/.*\/(.*)$/)[1];
  const name = filename.substring(0, filename.indexOf("."));
  const session = window.location.pathname.match(/session\d/)[0];
  const submenu = 'submenu' + session.match(/\d/);

  document.getElementById(submenu).classList.add("show");
  document.getElementsByName(name)[0].classList.add("active-side-nav");
  document.getElementsByName(session)[0].classList.add("active-side-nav");
  document.getElementsByName(session + '-nav')[0].classList.add("active-top-nav");
};

function updateSideNavOverview() {
  const session = window.location.pathname.match(/session\d/)[0];
  const submenu = 'submenu' + session.match(/\d/);
  document.getElementById(submenu).classList.add("show");
  document.getElementsByName(session + '-overview')[0].classList.add("active-side-nav");
  document.getElementsByName(session)[0].classList.add("active-side-nav");
  document.getElementsByName(session + '-nav')[0].classList.add("active-top-nav");
}

function fetchVideo(pathReference, el) {
  pathReference.getDownloadURL()
    .then((url) => {
      // // This can be downloaded directly:
      // var xhr = new XMLHttpRequest();
      // xhr.responseType = 'blob';
      // xhr.onload = (event) => {
      //     var blob = xhr.response;
      // };
      // xhr.open('GET', url);
      // xhr.send();

      // Or inserted into an <img> element
      el.setAttribute('src', url);
    })
    .catch((error) => {
      // Handle any errors
    });
}