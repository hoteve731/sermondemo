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
        { role: "system", content: `The following facts are available:\n\n${FACT.join("\n")}` },
        { role: "user", content: question },
      ],
      temperature: 0.5,
      max_tokens: 100,
    });

    const answer = response.data.choices[0].message.content.trim();
    const completeAnswer = removeIncompleteSentence(answer);

    if (answer === "") {
      res.status(200).json({ answer: "대답할 수 없는 질문입니다." });
    } else {
      if (isAnswerRelevant(completeAnswer, FACT)) {
        res.status(200).json({ answer: completeAnswer });
      } else {
        res.status(200).json({ answer: "주어진 정보로는 대답할 수 없는 질문입니다. '질의응답' 페이지에서 실제 사람들에게 질문을 해보세요." });
      }
    }
  } catch (error) {
    console.error("Error occurred:", error);
    console.error("Error response:", error.response);
    res.status(500).json({ error: "An error occurred while generating the answer.", details: error.message });
  }
}


// import axios from "axios";
// import { getFirestore, doc, getDoc } from "firebase/firestore";
// import { firebase, firestore } from "../../lib/firebase";


// const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
// const OPENAI_ORGANIZATION = process.env.OPENAI_ORGANIZATION;

// const openai = axios.create({
//   baseURL: "https://api.openai.com/v1",
//   headers: {
//     "Content-Type": "application/json",
//     Authorization: `Bearer ${OPENAI_API_KEY}`,
//     "OpenAI-Organization": OPENAI_ORGANIZATION,
//   },
// });

// async function getFactsFromFirestore() {
//   const db = getFirestore();
//   const factListDoc = doc(db, "Facts", "factList");
//   const docSnap = await getDoc(factListDoc);

//   if (docSnap.exists()) {
//     const data = docSnap.data();
//     return Object.values(data);
//   } else {
//     console.log("No facts found in Firestore.");
//     return [];
//   }
// }


// function isAnswerRelevant(answer, factArray) {
//   const answerWords = answer.toLowerCase().split(" ");
//   const factWords = factArray.map((fact) => fact.toLowerCase().split(" ")).flat();
//   const relevantWords = answerWords.filter((word) => factWords.includes(word));

//   const relevanceThreshold = 0.1; // Adjust this value as needed. 0과 1 사이, 0.15면 답변 15%가 factarray와 일치하는경우 관련있다고 판단
//   const relevanceRatio = relevantWords.length / answerWords.length;

//   return relevanceRatio >= relevanceThreshold;
// }

// export default async function handler(req, res) {
//   const { question } = req.body;

//   if (!question) {
//     res.status(400).json({ error: "No question provided." });
//     return;
//   }

//   try {
//     const FACT = await getFactsFromFirestore();
    
//     const response = await openai.post("/chat/completions", {
//       model: "gpt-3.5-turbo",
//       messages: [
//         { role: "system", content: `The following facts are available:\n\n${FACT.join("\n")}` },
//         { role: "user", content: question },
//       ],
//       temperature: 0.7,
//       max_tokens: 100,
//     });

//     const answer = response.data.choices[0].message.content.trim();
//     if (answer === "") {
//       res.status(200).json({ answer: "대답할 수 없는 질문입니다." });
//     } else {
//       if (isAnswerRelevant(answer, FACT)) {
//         res.status(200).json({ answer });
//       } else {
//         res.status(200).json({ answer: "주어진 정보로는 대답할 수 없는 질문입니다. '질의응답' 페이지에서 실제 사람들에게 질문을 해보세요." });
//       }
//     }
//   } catch (error) {
//     console.error("Error occurred:", error); // Log the error to the console
//     console.error("Error response:", error.response); // Log the error response to the console
//     res.status(500).json({ error: "An error occurred while generating the answer.", details: error.message });
//   }
// }
