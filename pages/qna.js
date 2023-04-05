import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import React, { useState, useEffect } from "react";
import styles from "../styles/QnA.module.css";
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Modal from "react-modal";

Modal.setAppElement("#__next");

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

const db = firebase.firestore();

export default function QnA() {
  const [questions, setQuestions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [questionsPerPage] = useState(5);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const indexOfLastQuestion = currentPage * questionsPerPage;
  const indexOfFirstQuestion = indexOfLastQuestion - questionsPerPage;
  const currentQuestions = questions.slice(indexOfFirstQuestion, indexOfLastQuestion);

  
  const handlePrevQuestion = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextQuestion = () => {
    if (indexOfLastQuestion < questions.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const [showWarning, setShowWarning] = useState(false);


  const handleAddQuestion = async () => {

    if (newQuestion.trim() === "") {
      setShowWarning(true);
      return;
    }
  
    setShowWarning(false);

    const newQuestionRef = await db.collection("QnA").add({ 질문내용: newQuestion });
    const newQuestionObj = {
      id: newQuestionRef.id,
      data: { 질문내용: newQuestion },
      answerCount: 0,
    };
    setQuestions([...questions, newQuestionObj]);
    setNewQuestion("");
  };
  
  const handleAddAnswer = async () => {
    await db
      .collection("QnA")
      .doc(selectedQuestion.id)
      .collection("답변")
      .add({ 답변내용: newAnswer });
    setAnswers([...answers, newAnswer]);
    setNewAnswer("");
  };
  

  

  useEffect(() => {
    const fetchData = async () => {
      const querySnapshot = await db.collection("QnA").get();
      const fetchedQuestions = await Promise.all(
        querySnapshot.docs.map(async (doc) => {
          const answersSnapshot = await doc.ref.collection("답변").get();
          return {
            id: doc.id,
            data: doc.data(),
            answerCount: answersSnapshot.size,
          };
        })
      );
      setQuestions(fetchedQuestions);
    };

    fetchData();
  }, []);

  const handleQuestionClick = async (question) => {
    setSelectedQuestion(question);
    const answersSnapshot = await db
      .collection("QnA")
      .doc(question.id)
      .collection("답변")
      .get();
    const fetchedAnswers = answersSnapshot.docs.map((doc) => doc.data()["답변내용"]);
    setAnswers(fetchedAnswers);
  };
  

  return (
    <>
      <Navbar />
      <div className={styles.container}>
        <div className={styles.questionsList}>
          <div className={styles.newQuestion}>
            <input
              type="text"
              className={styles.questionInput}
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="질문하기..."
              
            />
            <button onClick={handleAddQuestion} className={styles.addButton}>질문 추가</button>
            
          </div>
          {showWarning && (
    <p className={styles.warningMessage}>질문을 입력해 주세요.</p>
  )}
          <div className={styles.questionNavigation}>
            <button className={styles.pageButton} onClick={handlePrevQuestion}>
              이전
            </button>
            <span>{currentPage}</span>
            <button className={styles.pageButton} onClick={handleNextQuestion}>
              다음
            </button>
          </div>
  
          {currentQuestions.map((question) => (
            <div
              key={question.id}
              onClick={() => {
                handleQuestionClick(question);
                openModal();
              }}
              className={styles.questionItem}
            >
              {question.data["질문내용"]} (답변 {question.answerCount}개)
            </div>
          ))}
  
          
        </div>
  
        {selectedQuestion && (
          <Modal
            isOpen={isModalOpen}
            onRequestClose={closeModal}
            contentLabel="질문 상세"
            className={styles.modalContent}
            overlayClassName={styles.modalOverlay}

          >
            <div className={styles.questionDetails}>
              
              <p className={styles.modalQuestion}>Q | {selectedQuestion.data["질문내용"]}</p>
              <h3 className={styles.modaltitle}>답변</h3>
              <ul className={styles.modalAnswer}>
                {answers.map((답변, index) => (
                  <li key={index}>{답변}</li>
                ))}
              </ul>
              <div className={styles.newAnswer}>
              <input
                className={styles.modalInput}
                type="text"
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                placeholder="답변을 입력하세요..."
              />
              <button onClick={handleAddAnswer} className={styles.answerAddbtn}>추가</button>
            </div>
            <button onClick={closeModal}className={styles.closebtn}>닫기</button>
            </div>
            
          </Modal>
        )}
      </div>
    </>
  );
  
                  }  