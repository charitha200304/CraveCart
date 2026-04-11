import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.content}`}>
        <div className={styles.brand}>
          <Link to="/" className={styles.logo}>
            <span className={styles.logoIcon}>CC</span>
            <span className={styles.logoText}>CraveCart</span>
          </Link>
          <p className={styles.tagline}>
            Delicious food delivered to your doorstep
          </p>
        </div>

        <div className={styles.links}>
          <div className={styles.linkGroup}>
            <h4 className={styles.linkTitle}>Quick Links</h4>
            <Link to="/" className={styles.link}>Home</Link>
            <Link to="/restaurants" className={styles.link}>Restaurants</Link>
            <Link to="/cart" className={styles.link}>Cart</Link>
          </div>

          <div className={styles.linkGroup}>
            <h4 className={styles.linkTitle}>Account</h4>
            <Link to="/login" className={styles.link}>Sign In</Link>
            <Link to="/register" className={styles.link}>Register</Link>
            <Link to="/orders" className={styles.link}>My Orders</Link>
          </div>

          <div className={styles.linkGroup}>
            <h4 className={styles.linkTitle}>Support</h4>
            <a href="#" className={styles.link}>Help Center</a>
            <a href="#" className={styles.link}>Contact Us</a>
            <a href="#" className={styles.link}>Privacy Policy</a>
          </div>
        </div>
      </div>

      <div className={styles.bottom}>
        <div className="container">
          <p className={styles.copyright}>
            2024 CraveCart. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
