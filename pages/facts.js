// pages/facts.js
import { useState, useEffect } from "react";
import FACT from "../data/factData";
import styles from "../styles/facts.module.css";

const Facts = () => {
  const [facts, setFacts] = useState([]);
  const [newFact, setNewFact] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    setFacts(FACT);
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const addFact = () => {
    if (newFact) {
      setFacts([...facts, newFact]);
      setNewFact("");
    }
  };

  const deleteFact = (index) => {
    setFacts(facts.filter((fact, i) => i !== index));
  };

  return (
    <div className={`${styles.container} ${darkMode ? styles.darkMode : ""}`}>
      <h1>Real-time Facts</h1>
      <button className={styles.toggleDarkMode} onClick={toggleDarkMode}>
        {darkMode ? "Light Mode" : "Dark Mode"}
      </button>
      <ul className={styles.factList}>
        {facts.map((fact, index) => (
          <li key={index} className={styles.factItem}>
            {fact}
            <span className={styles.button} onClick={() => deleteFact(index)}>
              삭제
            </span>
          </li>
        ))}
      </ul>
      <div>
         <input
            type="text"
            value={newFact}
            onChange={(e) => setNewFact(e.target.value)}
            placeholder="Add a new fact"
            className={styles.inputText}
        />
        <button className={styles.button} onClick={addFact}>
          Add
        </button>
      </div>
    </div>
  );
};

export default Facts;
