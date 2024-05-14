
const firebaseConfig = {
  apiKey: "AIzaSyAgkCUR0Y-7jXurdxrVDYNxQVRQidiNJBw",
  authDomain: "code-the-future-hybrid.firebaseapp.com",
  projectId: "code-the-future-hybrid",
  storageBucket: "code-the-future-hybrid.appspot.com",
  messagingSenderId: "872086354850",
  appId: "1:872086354850:web:092e805b04287ae7fcd0fb",
  measurementId: "G-JSR5R0X09W",
  databaseURL: "https://code-the-future-hybrid-default-rtdb.europe-west1.firebasedatabase.app/"
};

firebase.initializeApp(firebaseConfig);

export const fbAuth = firebase.auth();
export const fbDB = firebase.database()
export const fbStorage = firebase.storage()