import firebase from 'firebase';

const firebaseConfig = {
    apiKey: "AIzaSyAtJ-pPGIPg7lQlDlziEdCICCT-tTyK4fQ",
    authDomain: "merchants-road.firebaseapp.com",
    databaseURL: "https://merchants-road.firebaseio.com",
    projectId: "merchants-road",
    storageBucket: "merchants-road.appspot.com",
    messagingSenderId: "199121637788",
    appId: "1:199121637788:web:7d97de634180ddc032f859"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

export default firebase;
