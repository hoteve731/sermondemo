// pages/_app.js
import React, { useState } from "react";
import "../public/styles.css";

function MyApp({ Component, pageProps }) {
  const [showModal, setShowModal] = useState(false);

  const openModal = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <>
      
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
