import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { 
  UtensilsCrossed, 
  ShoppingCart, 
  User, 
  LogOut, 
  ChevronDown,
  Menu,
  X,
  LayoutDashboard,
  ClipboardList
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { getItemCount } = useCart();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const itemCount = getItemCount();

  const handleLogout = () => {
    logout();
    navigate('/');
    setShowDropdown(false);
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/restaurants', label: 'Restaurants' },
  ];

  const isActive = (path) => location.pathname === path;

  // Don't show navbar on auth page
  if (location.pathname === '/auth') return null;

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-coral rounded-xl flex items-center justify-center">
              <UtensilsCrossed className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-navy">CraveCart</span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`font-medium transition-colors ${
                  isActive(link.to) 
                    ? 'text-coral' 
                    : 'text-muted hover:text-navy'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {/* Cart */}
            <Link 
              to="/cart" 
              className="relative p-2 rounded-xl hover:bg-slate-bg transition-colors"
            >
              <ShoppingCart className="w-6 h-6 text-navy" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-coral text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Auth */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-slate-bg transition-colors"
                >
                  <div className="w-8 h-8 bg-coral-light rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-coral" />
                  </div>
                  <span className="font-medium text-navy">{user?.name?.split(' ')[0]}</span>
                  <ChevronDown className={`w-4 h-4 text-muted transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {showDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="font-semibold text-navy">{user?.name}</p>
                        <p className="text-sm text-muted">{user?.email}</p>
                      </div>
                      
                      {user?.role === 'RESTAURANT_OWNER' && (
                        <Link
                          to="/owner/dashboard"
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-slate-bg transition-colors"
                        >
                          <LayoutDashboard className="w-5 h-5 text-muted" />
                          <span className="text-navy">Dashboard</span>
                        </Link>
                      )}

                      {user?.role === 'ADMIN' && (
                        <Link
                          to="/admin"
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-slate-bg transition-colors"
                        >
                          <LayoutDashboard className="w-5 h-5 text-muted" />
                          <span className="text-navy">Admin Panel</span>
                        </Link>
                      )}
                      
                      <Link
                        to="/orders"
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-slate-bg transition-colors"
                      >
                        <ClipboardList className="w-5 h-5 text-muted" />
                        <span className="text-navy">My Orders</span>
                      </Link>
                      
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors text-error"
                      >
                        <LogOut className="w-5 h-5" />
                        <span>Sign Out</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link to="/auth" className="hidden md:block btn-primary py-2 px-5">
                Sign In
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 rounded-xl hover:bg-slate-bg transition-colors"
            >
              {showMobileMenu ? (
                <X className="w-6 h-6 text-navy" />
              ) : (
                <Menu className="w-6 h-6 text-navy" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-100"
          >
            <div className="px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setShowMobileMenu(false)}
                  className={`block px-4 py-3 rounded-xl font-medium transition-colors ${
                    isActive(link.to) 
                      ? 'bg-coral-light text-coral' 
                      : 'text-navy hover:bg-slate-bg'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              
              {isAuthenticated ? (
                <>
                  <Link
                    to="/orders"
                    onClick={() => setShowMobileMenu(false)}
                    className="block px-4 py-3 rounded-xl font-medium text-navy hover:bg-slate-bg"
                  >
                    My Orders
                  </Link>
                  {user?.role === 'RESTAURANT_OWNER' && (
                    <Link
                      to="/owner/dashboard"
                      onClick={() => setShowMobileMenu(false)}
                      className="block px-4 py-3 rounded-xl font-medium text-navy hover:bg-slate-bg"
                    >
                      Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setShowMobileMenu(false);
                    }}
                    className="w-full text-left px-4 py-3 rounded-xl font-medium text-error hover:bg-red-50"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  to="/auth"
                  onClick={() => setShowMobileMenu(false)}
                  className="block btn-primary text-center"
                >
                  Sign In
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
