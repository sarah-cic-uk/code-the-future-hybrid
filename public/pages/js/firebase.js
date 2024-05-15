// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyAgkCUR0Y-7jXurdxrVDYNxQVRQidiNJBw",
  authDomain: "code-the-future-hybrid.firebaseapp.com",
  projectId: "code-the-future-hybrid",
  storageBucket: "code-the-future-hybrid.appspot.com",
  messagingSenderId: "872086354850",
  appId: "1:872086354850:web:092e805b04287ae7fcd0fb",
  measurementId: "G-JSR5R0X09W",
  databaseURL: "https://code-the-future-hybrid-default-rtdb.firebaseio.com"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

console.log("Firebase initialized.");

// Initialize Firebase SDK modules
export const fbAuth = firebase.auth();
export const fbDB = firebase.database();
// export const fbStorage = firebase.storage();

// Assign fbAuth and fbDb to global window
window.fbAuth = firebase.auth();
window.fbDB = firebase.database();
// window.fbStorage = firebase.storage();

// Confirm firebase variables available within firebase.js
console.log("Firebase SDK modules initialized within firebase.js...");

console.log("window.fbAuth:", window.fbAuth);
console.log("window.fbDB:", window.fbDB);
// console.log("window.fbStorage:", window.fbStorage);

console.log("fbAuth:", fbAuth);
console.log("fbDB:", fbDB);
// console.log("fbStorage:", fbStorage);
