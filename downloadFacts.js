// downloadFacts.js
const { initializeApp } = require("firebase/app");
const { getFirestore, doc, getDoc } = require("firebase/firestore");
const fs = require("fs");

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

initializeApp(firebaseConfig);

async function getFactsFromFirestore() {
  const db = getFirestore();
  const factListDoc = doc(db, "Facts", "factList");
  const docSnap = await getDoc(factListDoc);

  if (docSnap.exists()) {
    const data = docSnap.data();
    return Object.values(data);
  } else {
    console.log("No facts found in Firestore.");
    return [];
  }
}

async function downloadFacts() {
  const facts = await getFactsFromFirestore();

  const factDataContent = `const FACT = [\n  ${facts.map((fact) => JSON.stringify(fact)).join(",\n  ")}\n];\n\nmodule.exports = FACT;\n`;

  fs.writeFileSync("data/factData.js", factDataContent, "utf8");

  console.log("Facts successfully downloaded from Firestore and saved to data/factData.js.");
}

downloadFacts();
