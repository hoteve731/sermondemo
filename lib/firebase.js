import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

import { getAuth } from "firebase/auth";

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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const auth = getAuth(app);



export { app as firebase, db as firestore, auth};