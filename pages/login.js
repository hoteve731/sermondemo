// pages/login.js
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebase";
import styles from "../styles/Login.module.css";

const Login = () => {
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

  const signInWithEmailPassword = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/");
    } catch (error) {
      console.error("이메일/비밀번호 로그인 실패:", error);
    }
  };

  const signUpWithEmailPassword = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push("/");
    } catch (error) {
      console.error("이메일/비밀번호 회원가입 실패:", error);
    }
  };

  return (
    <body>
      <h1 className="mainlogo">ChatGBD</h1>
      <h3>돌아오신 걸 환영해요!</h3>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div>
          <button onClick={signInWithGoogle}>Google 로그인</button>
          <h3>구글 계정이 없다면</h3>
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호"
            />
            <button onClick={signInWithEmailPassword}>로그인</button>
            <button onClick={signUpWithEmailPassword}>새로 회원가입&로그인</button>
          </div>
        </div>
      )}

    </body>
  );
};

export default Login;
