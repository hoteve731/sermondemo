import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { auth, signOut } from '../lib/firebase';
import styles from './navbar.module.css';

const Navbar = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  const isActive = (route) => {
    return router.pathname === route ? styles.active : '';
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };

  return (
    <nav className={styles.navbar}>
      <ul>
        <li className={styles.li}>
          <Link href="/" passHref>
            <span className={`${styles.link} ${isActive('/')}`}>Home</span>
          </Link>
        </li>
        <li className={styles.li}>
          <Link href="/test" passHref>
            <span className={`${styles.link} ${isActive('/test')}`}>trained text</span>
          </Link>
        </li>
        {/* <li className={styles.li}>
          <Link href="/qna" passHref>
            <span className={`${styles.link} ${isActive('/qna')}`}>질의응답</span>
          </Link>
        </li> */}
        {user ? (
          <>
            <li className={styles.li}>
              <span className={styles.user}>{user.displayName || user.email} User</span>
            </li>
            <li className={styles.li}>
              <button className={styles.navlogout} onClick={handleLogout}>
                Sign out
              </button>
            </li>
          </>
        ) : (
          <li className={styles.li}>
            <Link href="/login" passHref>
              <span className={`${styles.link} ${isActive('/login')}`}>Sign in</span>
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
