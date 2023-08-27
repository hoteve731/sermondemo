import { useState, useEffect } from "react";
import axios from "axios";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import loaderStyles from "../styles/loader.module.css";
import Navbar from '../components/Navbar';
import { useRouter } from "next/router"; 
import { auth } from "../lib/firebase";

const linkifyAnswer = (answer) => {
  const urlRegex = /https?:\/\/[^\s]+/g;
  return answer.replace(urlRegex, (url) => `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`);
};

export default function Home() {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Welcome to Whisper. Ask anything.", sender: "bot" }
  ]);


  // const router = useRouter();
  // useEffect(() => {
  //   const unsubscribe = auth.onAuthStateChanged((user) => {
  //     if (!user) {
  //       router.push("/login");
  //     }
  //   });
  //   return () => unsubscribe();
  // }, [auth, router]);

  const handleFocus = (e) => {
    e.target.value = "";
  };

  const handleChange = (e) => {
    setQuestion(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (question === "") {
      return;
    }
    setLoading(true);
    try {
      const userMessage = { text: question, sender: "user" };
      setMessages((prevMessages) => [...prevMessages, userMessage]);

      const response = await axios.post("/api/chat", { question }); // Simplified request payload

      const botMessage = { text: response.data.answer, sender: "bot" };
      setMessages((prevMessages) => [...prevMessages, botMessage]);

      setQuestion("");
    } catch (error) {
      console.error("Error occurred:", error);
      const errorMessage = { text: "An error occurred while generating the answer. Please try again.", sender: "bot" };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <>
      <Navbar />

      <div className="container">
        <Head>
          <title>ChatGBD</title>
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css" />
        </Head>


        <div className="messages">
          {messages.map((message, index) => (
            <div key={index} className={message.sender}>
              <p
                dangerouslySetInnerHTML={{
                  __html: linkifyAnswer(message.text),
                }}
              ></p>
            </div>
          ))}
        </div>
        {loading && <div className={loaderStyles.loader}></div>}
        <form onSubmit={handleSubmit}>
          <input
            id="question"
            type="text"
            value={question}
            onChange={handleChange}
            onFocus={handleFocus}
            required
            aria-label="Enter your question"
            className="maininput"
          />
          <button type="submit" aria-label="Submit your question">
            Ask
          </button>
        </form>

      
      </div>
    </>
  );
}
