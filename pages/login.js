// pages/login.js
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../lib/firebase";
import styles from "../styles/Login.module.css"; 

const Login = () => {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        // 이미 로그인된 사용자
        router.push("/");
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [auth, router]);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push("/");
    } catch (error) {
      console.error("Google 로그인 실패:", error);
    }
  };

  return (
    <body>
        <h1 className="mainlogo">ChatGBD</h1>
        <h3>돌아오신 걸 환영해요!</h3>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <button onClick={signInWithGoogle}>Google 로그인</button>
      )}
        
      <h6>이 서비스를 사용하기 위해서는 로그인을 해야 합니다!</h6>

    </body>
       
  );
};

export default Login;
