import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from './navbar.module.css';

const Navbar = () => {
  const router = useRouter();

  const isActive = (route) => {
    return router.pathname === route ? styles.active : '';
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
            <span className={`${styles.link} ${isActive('/test')}`}>정보 모두보기</span>
          </Link>
        </li>
        <li className={styles.li}>
          <Link href="/qna" passHref>
            <span className={`${styles.link} ${isActive('/qna')}`}>질의응답</span>
          </Link>
        </li>
  
      </ul>
    </nav>
  );
};

export default Navbar;



// import Link from 'next/link';
// import styles from './navbar.module.css';

// const Navbar = () => {
//   return (
//     <nav className={styles.navbar}>
//       <ul>
//         <li className={styles.li}>
//           <Link href="/" passHref>
//             <span className={styles.link}>Home</span>
//           </Link>
//         </li>
//         <li className={styles.li}>
//           <Link href="/test" passHref>
//             <span className={styles.link}>정보 모두보기</span>
//           </Link>
//         </li>
//         <li className={styles.li}>
//           <Link href="/qna" passHref>
//             <span className={styles.link}>질의응답</span>
//           </Link>
//         </li>
//       </ul>
//     </nav>
//   );
// };

// export default Navbar;
