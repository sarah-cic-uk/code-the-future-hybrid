
function auth(loginBtn, profileBtn){
    if (localStorage.getItem('loggedIn') === "true") {
      loginBtn.style.display = "none";
     profileBtn.style.display = "block";
    }
    else {
      loginBtn.style.display = "block";
      profileBtn.style.display = "none";
    }
    }
  
function getPath(){
  const BASE_URL = window.location.origin;
  const PATH = BASE_URL.includes('github')
    ? '/code-the-future-hybrid/'
    : BASE_URL.includes('app') ? '/' : '/public/';
    return PATH;
}