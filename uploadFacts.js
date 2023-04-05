// uploadFacts.js
const admin = require("firebase-admin");
const FACT = require("./data/factData.js");

// 저장한 JSON 키 파일 경로를 사용하여 Firebase Admin SDK를 초기화합니다.
const serviceAccount = require("./teamgbd-ee466-firebase-adminsdk-tngbt-51143e62ff.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const firestore = admin.firestore();

const uploadFacts = async () => {
  const factDocument = firestore.collection("Facts").doc("factList");

  const factData = FACT.reduce((accumulator, fact, index) => {
    accumulator[`fact${index + 1}`] = fact;
    return accumulator;
  }, {});

  try {
    await factDocument.set(factData);
    console.log("Facts uploaded successfully!");
  } catch (error) {
    console.error("Error uploading facts:", error);
  }
};

uploadFacts();
