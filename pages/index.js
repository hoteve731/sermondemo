import { useState, useEffect } from "react";
import axios from "axios";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import loaderStyles from "../styles/loader.module.css";
import Navbar from '../components/Navbar';

const linkifyAnswer = (answer) => {
  const urlRegex = /https?:\/\/[^\s]+/g;
  return answer.replace(urlRegex, (url) => `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`);
};

export default function Home() {
  const [question, setQuestion] = useState("");
  const [submittedQuestion, setSubmittedQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch data or perform any action on component mount
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (question === submittedQuestion) {
      return;
    }
    setLoading(true);
    setSubmittedQuestion(question);
    try {
      const response = await axios.post("/api/chat", { question });
      setAnswer(response.data.answer);
      setQuestion("");
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setAnswer("질문을 입력해주세요.");
      } else {
        setAnswer("문제가 발생했습니다. 나중에 다시 시도해주세요.");
      }
      console.error("Error occurred:", error);
    } finally {
      setLoading(false);
    }
  };
  
  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setLoading(true);
  //   setSubmittedQuestion(question);
  //   const response = await axios.post("/api/chat", { question });
  //   setAnswer(response.data.answer);
  //   setQuestion("");
  //   setLoading(false);
    
  // };

  const handleFocus = (e) => {
    e.target.value = "";
    // e.target.select();
  };

  // const handleChange = (e) => {
  //   if (e.target.value !== submittedQuestion) {
  //     setSubmittedQuestion("");
  //   }
  //   setQuestion(e.target.value);
  // };
  const handleChange = (e) => {
    setSubmittedQuestion("");
    setQuestion(e.target.value);
  };
  
  return (
    <>
      <Navbar />
    
  
    <div className="container">
      
     
    
    
      <Head>
        <title>ChatGBD</title>
      </Head>
      
      
    
      <h1 className="mainlogo">ChatGBD</h1>
      <form onSubmit={handleSubmit}>
        <input
          id="question"
          type="text"
          value={question || submittedQuestion}
          onChange={handleChange}
          onFocus={handleFocus}
          required
          aria-label="Enter your question"
          className="maininput"
        />
        <button type="submit" aria-label="Submit your question">
          물어보기
        </button>
      </form>
      {loading && <div className={loaderStyles.loader}></div>}
      
      {answer && (
        <div className="answer">
          
          <h4 className="dap">AI의 답</h4>
          <p
            className="answertext"
            dangerouslySetInnerHTML={{
              __html: linkifyAnswer(answer),
            }}
          ></p>
        </div>
      )}
      <h6>
        답변은 부정확할 수 있지만 <br />최대한 검증된 정보들로만 구성되어 있습니다.
        <br /><br />
        '정보 모두보기'에서 인공지능이 학습한 <br />모든 정보들을 보실 수 있습니다. 
        <br /><br />
        인공지능이 답변을 하지 못하는 경우,<br /> '질의응답'에서 실제 사람들과 질의응답을 나눠보세요. 
      </h6>
     
    </div>
    </>
  );
}