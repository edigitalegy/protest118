// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyB7_D2VBx2_ozgshYN1BAbojH_9Aog5cC8",
  authDomain: "pro118-d8c9b.firebaseapp.com",
  projectId: "pro118-d8c9b",
  storageBucket: "pro118-d8c9b.firebasestorage.app",
  messagingSenderId: "89940755315",
  appId: "1:89940755315:web:548b46f1f81b7cd6a8bb06"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
const auth = firebase.auth();
const db = firebase.firestore();

export { db, auth };
