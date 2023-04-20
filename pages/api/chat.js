import axios from "axios";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { firebase, firestore } from "../../lib/firebase";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_ORGANIZATION = process.env.OPENAI_ORGANIZATION;

const openai = axios.create({
  baseURL: "https://api.openai.com/v1",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${OPENAI_API_KEY}`,
    "OpenAI-Organization": OPENAI_ORGANIZATION,
  },
});

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

function isAnswerRelevant(answer, factArray) {
  const answerWords = answer.toLowerCase().split(" ");
  const factWords = factArray.map((fact) => fact.toLowerCase().split(" ")).flat();
  const relevantWords = answerWords.filter((word) => factWords.includes(word));

  const relevanceThreshold = 0.1;
  const relevanceRatio = relevantWords.length / answerWords.length;

  return relevanceRatio >= relevanceThreshold;
}

function removeIncompleteSentence(answer) {
  const sentences = answer.split(". ");
  const lastSentence = sentences[sentences.length - 1];

  if (lastSentence.endsWith(".") || lastSentence.endsWith("?") || lastSentence.endsWith("!")) {
    return answer;
  } else {
    return sentences.slice(0, -1).join(". ") + ".";
  }
}

function getRelevantFacts(answer, factArray) {
  const answerWords = answer.toLowerCase().split(" ");
  const relevantFacts = [];

  factArray.forEach((fact) => {
    const factWords = fact.toLowerCase().split(" ");
    const relevantWords = answerWords.filter((word) => factWords.includes(word));
    const relevanceRatio = relevantWords.length / answerWords.length;

    if (relevanceRatio >= 0.2) {
      relevantFacts.push(fact);
    }
  });

  return relevantFacts.length > 0 ? relevantFacts : [factArray[0]];
}



export default async function handler(req, res) {
  const { question } = req.body;

  if (!question) {
    res.status(400).json({ error: "No question provided." });
    return;
  }

  try {
    const FACT = await getFactsFromFirestore();

    const response = await openai.post("/chat/completions", {
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: `You are a language model assistant that can ONLY use the following facts to answer questions. You cannot use any information not provided in these facts:\n\n${FACT.join("\n")}` },
        { role: "user", content: question },
      ],
      temperature: 1,
      max_tokens: 200,
    });

    const answer = response.data.choices[0].message.content.trim();
    const completeAnswer = removeIncompleteSentence(answer);
    const relevantFacts = getRelevantFacts(completeAnswer, FACT);
    
    if (answer === "") {
      res.status(200).json({ answer: "대답할 수 없는 질문입니다." });
    } else {
      const relevantFacts = getRelevantFacts(completeAnswer, FACT);
      res.status(200).json({ answer: completeAnswer, relevantFacts });
    }
  } catch (error) {
    console.error("Error occurred:", error);
    console.error("Error response:", error.response);
    res.status(500).json({ error: "An error occurred while generating the answer.", details: error.message });
  }
}