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
export let fbAuth, fbDB, fbStorage, currentUser;

async function initFirebase() {
  // Replace with secrets management?
  const ChrisfirebaseConfig = {
    apiKey: "AIzaSyA1M-spdbLBikmMNzAol0m3uE0_WZYAXWU",
    authDomain: "pokemon-firebase-820fd.firebaseapp.com",
    projectId: "pokemon-firebase-820fd",
    storageBucket: "pokemon-firebase-820fd.appspot.com",
    messagingSenderId: "866190768035",
    appId: "1:866190768035:web:f63814c66decac85d28c16",
    measurementId: "G-R5R0X09W",
    databaseURL:
      "https://code-the-future-hybrid-default-rtdb.europe-west1.firebasedatabase.app/",
  };

  const firebaseConfig = {
    apiKey: "AIzaSyAgkCUR0Y-7jXurdxrVDYNxQVRQidiNJBw",
    authDomain: "code-the-future-hybrid.firebaseapp.com",
    projectId: "code-the-future-hybrid",
    storageBucket: "code-the-future-hybrid.appspot.com",
    messagingSenderId: "872086354850",
    appId: "1:872086354850:web:092e805b04287ae7fcd0fb",
    measurementId: "G-JSR5R0X09W",
    databaseURL:
      "https://code-the-future-hybrid-default-rtdb.europe-west1.firebasedatabase.app/",
  };

  firebase.initializeApp(firebaseConfig);

  // Set Firebase variables
  fbAuth = firebase.auth();
  fbDB = firebase.database();
  fbStorage = firebase.storage();

  window.fbAuth = fbAuth;
  window.fbDB = fbDB;

  globalThis.fbAuth = fbAuth;
  globalThis.fbDB = fbDB;

  console.log(
    "Firebase SDK modules and Firebase core both initialized within firebase.js..."
  );

  console.log("fbAuth:", fbAuth);
  console.log("fbDB:", fbDB);
  console.log("fbStorage:", fbStorage);
}
// Call loadFirebase when the document is ready
document.addEventListener("DOMContentLoaded", loadFirebase);
