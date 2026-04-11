import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { getItemCount } = useCart();
  const navigate = useNavigate();
  
  const itemCount = getItemCount();

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  return (
    <header className={styles.header}>
      <nav className={`container ${styles.nav}`}>
        <Link to="/" className={styles.logo}>
          <span className={styles.logoIcon}>CC</span>
          <span className={styles.logoText}>CraveCart</span>
        </Link>

        <div className={styles.navLinks}>
          <Link to="/" className={styles.navLink}>Home</Link>
          <Link to="/restaurants" className={styles.navLink}>Restaurants</Link>
          {isAuthenticated && (
            <Link to="/orders" className={styles.navLink}>Orders</Link>
          )}
        </div>

        <div className={styles.navActions}>
          <Link to="/cart" className={styles.cartBtn}>
            <ShoppingCart size={20} />
            {itemCount > 0 && (
              <span className={styles.cartBadge}>{itemCount}</span>
            )}
          </Link>

          {isAuthenticated ? (
            <div className={styles.userMenu}>
              <button className={styles.userBtn}>
                <User size={20} />
                <span className={styles.userName}>{user?.name}</span>
              </button>
              <button onClick={handleLogout} className={styles.logoutBtn}>
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary">
              Sign In
            </Link>
          )}

          <button 
            className={styles.menuToggle}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className={styles.mobileMenu}>
            <Link to="/" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>
              Home
            </Link>
            <Link to="/restaurants" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>
              Restaurants
            </Link>
            <Link to="/cart" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>
              Cart ({itemCount})
            </Link>
            {isAuthenticated ? (
              <>
                <Link to="/orders" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>
                  My Orders
                </Link>
                <button onClick={handleLogout} className={styles.mobileLink}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>
                  Sign In
                </Link>
                <Link to="/register" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>
                  Register
                </Link>
              </>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}
