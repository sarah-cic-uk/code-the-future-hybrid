// Load Firebase JavaScript SDK
async function loadFirebase() {
  const scripts = [
    "https://www.gstatic.com/firebasejs/10.10.0/firebase-app-compat.js",
    "https://www.gstatic.com/firebasejs/10.10.0/firebase-analytics-compat.js",
    "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth-compat.js",
    "https://www.gstatic.com/firebasejs/10.10.0/firebase-database-compat.js",
    "https://www.gstatic.com/firebasejs/10.10.0/firebase-storage-compat.js",
  ];

  await Promise.all(
    scripts.map((src) => {
      return new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = src;
        script.onload = resolve;
        document.head.appendChild(script);
      });
    })
  );

  initFirebase();
}

// Initialize Firebase
export let fbAuth, fbDB, fbStorage;

async function initFirebase() {
  // Replace with secrets management?
  const firebaseConfig = {
    apiKey: "AIzaSyA1M-spdbLBikmMNzAol0m3uE0_WZYAXWU",
    authDomain: "pokemon-firebase-820fd.firebaseapp.com",
    projectId: "pokemon-firebase-820fd",
    storageBucket: "pokemon-firebase-820fd.appspot.com",
    messagingSenderId: "866190768035",
    appId: "1:866190768035:web:f63814c66decac85d28c16",
    measurementId: "G-R5R0X09W",
    databaseURL: "http://pokemon-firebase-820fd-default-rtdb.firebaseio.com",
  };

  firebase.initializeApp(firebaseConfig);

  // Set Firebase variables
  fbAuth = firebase.auth();
  fbDB = firebase.database();
  fbStorage = firebase.storage();

  window.fbAuth = fbAuth;
  window.fbDB = fbDB;
  window.fbStorage = fbStorage;

  console.log(
    "Firebase SDK modules and Firebase core both initialized within firebase.js..."
  );

  console.log("fbAuth:", fbAuth);
  console.log("fbDB:", fbDB);
  console.log("fbStorage:", fbStorage);
}
// Call loadFirebase when the document is ready
document.addEventListener("DOMContentLoaded", loadFirebase);
