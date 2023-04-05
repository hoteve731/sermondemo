import firebase from "firebase/compat/app";
import "firebase/compat/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDlGPM9a6Wcbv1EeW7MqcwSHd-1SxZTSNg",
    authDomain: "teamgbd-ee466.firebaseapp.com",
    databaseURL: "https://teamgbd-ee466-default-rtdb.firebaseio.com",
    projectId: "teamgbd-ee466",
    storageBucket: "teamgbd-ee466.appspot.com",
    messagingSenderId: "548704215235",
    appId: "1:548704215235:web:1a8d428606c570b0f94276",
    measurementId: "G-NG0H5VGJV0"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const firestore = firebase.firestore(); 

export { firebase, firestore };