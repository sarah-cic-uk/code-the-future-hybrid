import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-analytics.js";
// import firebase from "firebase/compat/app";
// import "firebase/compat/auth";
// import { initializeApp } from 'firebase/app';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAgkCUR0Y-7jXurdxrVDYNxQVRQidiNJBw",
  authDomain: "code-the-future-hybrid.firebaseapp.com",
  projectId: "code-the-future-hybrid",
  storageBucket: "code-the-future-hybrid.appspot.com",
  messagingSenderId: "872086354850",
  appId: "1:872086354850:web:092e805b04287ae7fcd0fb",
  measurementId: "G-JSR5R0X09W"
};

// Initialize Firebase
//  const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
firebase.initializeApp(firebaseConfig);

export const auth = firebase.auth();

function login(event) {
  console.log("logging in ");
  event.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  auth
    .signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      // Signed in
      var user = userCredential.user;
      console.log("SIGNED IN AS ", user);
    })
    .catch((error) => {
      console.log("error signing in: ", error.message);
    });
}
