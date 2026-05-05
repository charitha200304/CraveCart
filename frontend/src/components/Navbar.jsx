import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Menu, X, ChefHat, Package, Home, Utensils } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout, isAuthenticated, isOwner, isAdmin } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = isOwner ? [
    { to: '/dashboard', label: 'Dashboard', icon: Home },
    { to: '/my-restaurant', label: 'My Restaurant', icon: ChefHat },
  ] : isAdmin ? [
    { to: '/admin', label: 'Admin', icon: Home },
  ] : [
    { to: '/', label: 'Home', icon: Home },
    { to: '/restaurants', label: 'Restaurants', icon: Utensils },
    { to: '/orders', label: 'My Orders', icon: Package },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header style={{ background: 'white', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 100, height: '64px', display: 'flex', alignItems: 'center' }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', background: 'var(--primary)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ChefHat size={20} color="white" />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '20px', letterSpacing: '-0.02em' }}>
            Crave<span style={{ color: 'var(--primary)' }}>Cart</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '4px' }} className="hide-mobile">
          {navLinks.map(({ to, label }) => (
            <Link key={to} to={to} className={`btn btn-ghost ${isActive(to) ? 'active' : ''}`}
              style={isActive(to) ? { color: 'var(--primary)', background: 'var(--primary-bg)' } : {}}>
              {label}
            </Link>
          ))}
        </nav>

        {/* Right Side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {isAuthenticated && !isOwner && !isAdmin && (
            <Link to="/cart" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: 'var(--radius-full)', background: 'var(--border-light)', color: 'var(--text-primary)', transition: 'all var(--transition)' }}
              onMouseEnter={e => e.currentTarget.style.background='var(--primary-bg)'}
              onMouseLeave={e => e.currentTarget.style.background='var(--border-light)'}>
              <ShoppingCart size={20} />
              {totalItems > 0 && (
                <span className="notif-badge">{totalItems > 9 ? '9+' : totalItems}</span>
              )}
            </Link>
          )}

          {isAuthenticated ? (
            <div style={{ position: 'relative' }}>
              <button onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', borderRadius: 'var(--radius-full)', border: '1.5px solid var(--border)', background: 'var(--surface)', transition: 'all var(--transition)' }}
                onMouseEnter={e => e.currentTarget.style.borderColor='var(--primary)'}
                onMouseLeave={e => e.currentTarget.style.borderColor='var(--border)'}>
                <div className="avatar" style={{ width: '28px', height: '28px', fontSize: '13px' }}>
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <span style={{ fontSize: '14px', fontWeight: 600 }} className="hide-mobile">{user?.name?.split(' ')[0]}</span>
              </button>
              {dropdownOpen && (
                <>
                  <div onClick={() => setDropdownOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 10 }} />
                  <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '8px', minWidth: '200px', boxShadow: 'var(--shadow-lg)', zIndex: 20 }}>
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', marginBottom: '8px' }}>
                      <div style={{ fontWeight: 600, fontSize: '14px' }}>{user?.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>{user?.email}</div>
                      <div style={{ marginTop: '6px' }}>
                        <span className="badge badge-primary" style={{ fontSize: '11px' }}>{user?.role}</span>
                      </div>
                    </div>
                    <button onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', borderRadius: 'var(--radius-sm)', color: 'var(--error)', fontSize: '14px', fontWeight: 500, transition: 'all var(--transition)' }}
                      onMouseEnter={e => e.currentTarget.style.background='#FEF2F2'}
                      onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <Link to="/login" className="btn btn-secondary btn-sm">Sign In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Join Free</Link>
            </div>
          )}

          {/* Mobile menu button */}
          <button onClick={() => setMenuOpen(!menuOpen)} style={{ display: 'none' }} className="mobile-menu-btn">
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <style>{`
        @media(max-width:768px){
          .mobile-menu-btn{display:flex!important;align-items:center;padding:8px;border-radius:var(--radius-sm)}
        }
      `}</style>
    </header>
  );
}
