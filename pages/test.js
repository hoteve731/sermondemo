import { firestore } from "../lib/firebase";
import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "../styles/TestPage.module.css";
import Navbar from '../components/Navbar';
import { useRef } from "react";
import { collection, limit, query, getDocs, doc, runTransaction, getDoc } from "firebase/firestore";



const TestPage = () => {
  const [allFacts, setAllFacts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1); // 페이지 번호를 추적하는 상태
  const [factsPerPage] = useState(7); // 한 페이지당 표시할 fact 개수
  const [searchTerm, setSearchTerm] = useState("");

  const [modalVisible, setModalVisible] = useState(false);
  const inputRef = useRef();

  const handleModalOpen = () => {
    setModalVisible(true);
  };

  const handleModalClose = () => {
    inputRef.current.value = "";
    setModalVisible(false);
  };

  const handleFactSubmit = async () => {
    if (inputRef.current.value.trim() === "") {
      return;
    }
  
    const newFact = inputRef.current.value.trim();
    const docRef = doc(firestore, "Facts", "factList");
    await runTransaction(firestore, async (transaction) => {
      const factListDoc = await getDoc(docRef);
  
      if (!factListDoc.exists()) {
        throw Error("FactList document does not exist.");
      }
  
      const data = factListDoc.data();
      const newKey = `fact${Object.keys(data).length + 1}`;
      transaction.update(docRef, { [newKey]: newFact });
    });
  
    handleModalClose();
    // 페이지를 새로고침하여 새로운 사실을 표시합니다.
    window.location.reload();
  };
  
  useEffect(() => {
    const fetchData = async () => {
      const factCollection = collection(firestore, "Facts");
      const factQuery = query(factCollection, limit(1));
      const querySnapshot = await getDocs(factQuery);
      const doc = querySnapshot.docs[0];
      if (doc) {
        const docData = doc.data();
        const factList = Object.entries(docData).map(([key, value]) => {
          return { id: key, content: value };
        });
        setAllFacts(factList);
      }
    };
  
    fetchData();
  }, []);
  

  const indexOfLastFact = currentPage * factsPerPage;
  const indexOfFirstFact = indexOfLastFact - factsPerPage;
  const currentFacts = allFacts
    .filter((fact) =>
      fact.content.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .slice(indexOfFirstFact, indexOfLastFact);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (indexOfLastFact < allFacts.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const linkify = (text) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(
      urlRegex,
      (url) =>
        `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`
    );
  };

  return (
    <>
      <Navbar />
      <div className={styles.container}>
        <div className={styles.searchBar}>
          <input
            id="filterInput"
            type="text"
            placeholder="정보 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className={styles.pagination}>
          <button className={styles.pageButton} onClick={handlePrevPage}>
            이전
          </button>
          <span>{currentPage}</span>
          <button className={styles.pageButton} onClick={handleNextPage}>
            다음
          </button>
        </div>
        <ul className={styles.factList}>
          {currentFacts.length > 0 ? (
            currentFacts.map((fact) => (
              <li key={fact.id} className={styles.factItem}>
                <div dangerouslySetInnerHTML={{ __html: linkify(fact.content) }} />
              </li>
            ))
          ) : (
            <li className={styles.noResults}>검색 결과가 없습니다.</li>
          )}
        </ul>
  
        <button className={styles.floatingButton} onClick={handleModalOpen}>
          +
        </button>
      </div>
  
      {modalVisible && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <input
              ref={inputRef}
              type="text"
              className={styles.modalInput}
              placeholder="새 정보를 입력하세요..."
            />
            <h6>이 정보는 서버에 전송되며, 앞으로 인공지능이 답변을 할 때 참고하게 됩니다.</h6>
            <div className={styles.modalButtons}>
    
              <button onClick={handleModalClose} className={styles.cancelbtn}>취소</button>
              <button onClick={handleFactSubmit} className={styles.submitbtn}>전송</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
  
};

export default TestPage;
