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
  const tokenizedAnswer = answer.toLowerCase().split(" ");
  const tokenizedFacts = factArray.map((fact) => fact.toLowerCase().split(" "));

  let maxOverlap = 0;
  tokenizedFacts.forEach((factTokens) => {
    let overlap = 0;
    factTokens.forEach((token) => {
      if (tokenizedAnswer.includes(token)) {
        overlap += 1;
      }
    });
    maxOverlap = Math.max(maxOverlap, overlap);
  });

  const relevanceThreshold = 0.2;
  const relevanceRatio = maxOverlap / tokenizedAnswer.length;

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

    if (relevanceRatio >= 0.25) { // Increased the threshold to make the filtering more strict
      const highlightedFact = factWords
        .map((word) => (relevantWords.includes(word) ? `<b>${word}</b>` : word))
        .join(" ");
      relevantFacts.push({ text: highlightedFact, count: relevantWords.length });
    }
  });

  // Sort relevantFacts by the number of highlighted keywords in descending order
  relevantFacts.sort((a, b) => b.count - a.count);

  // Limit the number of returned relevant facts to 5
  const limitedRelevantFacts = relevantFacts.slice(0, 5).map((fact) => fact.text);

  return limitedRelevantFacts.length > 0 ? limitedRelevantFacts : [factArray[0]];
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
      model: "gpt-4",
      messages: [
        { role: "system", content: `You are a language model assistant that can ONLY use the following facts to answer questions. You cannot use any information not provided in these facts:\n\n${FACT.join("\n")}` },
        { role: "user", content: question },
      ],
      temperature: 0.7,
      max_tokens: 200,
    });

    const answer = response.data.choices[0].message.content.trim();
    const completeAnswer = removeIncompleteSentence(answer);
    const relevantFacts = getRelevantFacts(completeAnswer, FACT);
    
    if (isAnswerRelevant(completeAnswer, FACT)) {
      res.status(200).json({ answer: completeAnswer, relevantFacts });
    } else {
      res.status(200).json({ answer: "주어진 정보로는 대답할 수 없는 질문입니다. 질의응답 페이지에서 실제 사람들에게 질문해보세요." });
    }
  } catch (error) {
    console.error("Error occurred:", error);
    console.error("Error response:", error.response);
    res.status(500).json({ error: "An error occurred while generating the answer.", details: error.message });
  }
}
