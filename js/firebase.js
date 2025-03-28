const firebaseConfig = {
  apiKey: "AIzaSyAn1WJlBAswXIG0CkgBEvotVNv2kA0ZOSg",
  authDomain: "pro118-7f642.firebaseapp.com",
  projectId: "pro118-7f642",
  storageBucket: "pro118-7f642.firebasestorage.app",
  messagingSenderId: "321523218557",
  appId: "1:321523218557:web:dcfc0c4f7eb3cb1c251914"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
const auth = firebase.auth();
const db = firebase.firestore();

export { db, auth };


